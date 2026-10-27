'use client';

import { useState } from 'react';
import { PlaceResultItem } from '@/app/api/places/route';
import { 
  X, MapPin, Clock, DollarSign, CheckCircle2, MessageCircle, 
  Phone, AlertTriangle, FileText, UserCheck, Navigation, ExternalLink,
  Mail, ShieldCheck, Globe, Briefcase, Share2, Copy, Check, Sparkles,
  Award, ShieldAlert, Bus, Utensils, HeartHandshake, ChevronRight
} from 'lucide-react';

interface VacancyDetailModalProps {
  place: PlaceResultItem | null;
  onClose: () => void;
  onOpenReport: (place: PlaceResultItem) => void;
  onOpenCalculator?: () => void;
  onOpenCvBuilder?: () => void;
}

export default function VacancyDetailModal({ place, onClose, onOpenReport, onOpenCalculator, onOpenCvBuilder }: VacancyDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'requirements' | 'apply' | 'safety'>('info');
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!place) return null;

  // Mensaje predeterminado para WhatsApp formal en Venezuela
  const rawWhatsAppText = `Hola, cordial saludo. Vi en ChambaCerca que en ${place.placeName} tienen vacante activa para "${place.title || 'el puesto publicado'}". Cumplo con los requisitos y quisiera consignar mi síntesis curricular. ¿Con quién o en qué horario podría presentarme? Muchas gracias.`;
  
  const whatsappUrl = place.contactWhatsapp
    ? `https://wa.me/${place.contactWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(rawWhatsAppText)}`
    : null;

  // Enlaces de Google Maps
  const googleMapsPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.placeName} ${place.address}`)}`;
  const googleMapsWalkingUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&travelmode=walking`;
  const googleStreetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${place.latitude},${place.longitude}`;

  const copyToClipboard = (text: string, type: 'message' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'message') {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] bg-[#0A101C] border border-slate-700/80 rounded-3xl shadow-2xl shadow-emerald-950/40 flex flex-col overflow-hidden text-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado con Identidad y Badges */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80 bg-gradient-to-r from-[#0C1527] via-[#0B1322] to-[#0A101C] flex items-start justify-between gap-4 relative">
          <div className="flex items-start gap-3.5">
            <div className="relative">
              <span className="text-3xl sm:text-4xl p-2.5 rounded-2xl bg-slate-900 border border-emerald-500/30 flex items-center justify-center shadow-lg">
                {place.categoryIcon}
              </span>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0C1527] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {place.isOfficiallyVerified ? 'Canal Oficial Verificado' : 'Vacante Activa Confirmada'}
                </span>
                <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                  {place.categoryLabel}
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-800/50 flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  {place.distanceFormatted} ({place.walkTimeMinutes} min a pie)
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
                {place.title || place.placeName}
              </h2>

              <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{place.placeName}</span>
                {place.city && <span className="text-slate-400 text-xs font-normal">({place.city})</span>}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{place.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => copyToClipboard(window.location.href, 'link')}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition"
              title="Copiar enlace de esta vacante"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Pestañas Interactivas */}
        <div className="flex border-b border-slate-800 bg-slate-950/80 px-4 sm:px-6 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Puesto & Remuneración</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requirements')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'requirements'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Requisitos & Papeles</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('apply')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'apply'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp & Cómo Aplicar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('safety')}
            className={`py-2.5 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'safety'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ChambaSegura 🛡️</span>
          </button>
        </div>

        {/* Contenido Dinámico de la Pestaña Activa */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[60vh]">
          
          {/* =========================================================================
              PESTAÑA 1: INFORMACIÓN DEL PUESTO, SALARIO Y BENEFICIOS
              ========================================================================= */}
          {activeTab === 'info' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Tarjetas de Remuneración y Horario */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      Paquete Salarial Estimado
                    </p>
                    <p className="font-black text-emerald-300 text-base sm:text-lg mt-0.5">
                      {place.salaryRange || '$180 - $220 + Bono'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Pago quincenal puntual a tasa oficial BCV + Cesta Ticket de ley.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      Jornada y Horarios
                    </p>
                    <p className="font-bold text-slate-200 text-sm mt-0.5">
                      {place.schedule || 'Lunes a Sábado, turnos rotativos (Mañana / Tarde)'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Incluye descansos reglamentarios y transporte nocturno de salida.
                    </p>
                  </div>
                </div>
              </div>

              {/* Descripción Detallada */}
              {place.description && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Descripción y Funciones del Puesto</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                    {place.description}
                  </p>
                </div>
              )}

              {/* Beneficios Ofrecidos */}
              {place.benefits && place.benefits.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    <span>Beneficios para el Colaborador en Venezuela</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {place.benefits.map((ben, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{ben}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Widget de Impacto Económico / Ahorro en Pasajes */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#0B1526] to-slate-900 border border-emerald-500/40 flex items-center justify-between gap-3 flex-wrap shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white flex items-center gap-2">
                      <span>¿Cuánto dinero te ahorras trabajando aquí?</span>
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                        Caminata: {place.walkTimeMinutes} min
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Al no pagar camioneticas diarias, tu salario rinde hasta un <strong>+25% más en comida y gastos de tu casa</strong>.
                    </p>
                  </div>
                </div>

                {onOpenCalculator && (
                  <button
                    onClick={onOpenCalculator}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md shadow-emerald-950 cursor-pointer"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Ver Balance en Calculadora</span>
                  </button>
                )}
              </div>

              {/* Accesos a Google Maps */}
              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  <span>Ubicación y Rutas en Google Maps:</span>
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={googleMapsPlaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition"
                  >
                    <span>Abrir en Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={googleStreetViewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition"
                  >
                    <span>Fachada Street View</span>
                  </a>
                  <a
                    href={googleMapsWalkingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-xs font-medium flex items-center gap-1 transition"
                  >
                    <Navigation className="w-3 h-3 text-emerald-400" />
                    <span>Caminar ({place.walkTimeMinutes} min)</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              PESTAÑA 2: REQUISITOS & DOCUMENTOS PARA PRESENTARSE EN VENEZUELA
              ========================================================================= */}
          {activeTab === 'requirements' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Requisitos Específicos del Empleador */}
              {place.requirements && place.requirements.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" />
                    <span>Requisitos Específicos Solicitados</span>
                  </h3>
                  <div className="space-y-2">
                    {place.requirements.map((req, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200">
                        <span className="w-5 h-5 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Guía Indispensable de Documentos en Venezuela */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0B1320] to-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Carpeta de Documentos Recomendada (Llevar en físico):</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Cédula de Identidad:</strong> Original laminada + 2 copias claras ampliadas.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Síntesis Curricular (CV):</strong> Máximo 1 a 2 páginas con foto y datos de contacto vigentes.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>RIF Actualizado:</strong> Copia digital o impresa del comprobante fiscal SENIAT.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Manipulación de Alimentos:</strong> Certificado de salud y manipulación (para perecederos y cocina).</span>
                  </div>
                </div>

                {/* Llamado a Acción: Generador Rápido de CV */}
                {onOpenCvBuilder && (
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap bg-cyan-950/20 p-3 rounded-xl border border-cyan-800/30">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-slate-200">
                        ¿No tienes tu currículum listo para llevar o enviar?
                      </span>
                    </div>
                    <button
                      onClick={onOpenCvBuilder}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-cyan-950 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generar CV (1 Página) Ahora</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              PESTAÑA 3: WHATSAPP DIRECTO & CÓMO POSTULARTE
              ========================================================================= */}
          {activeTab === 'apply' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Generador de Mensaje de WhatsApp Directo */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-[#0A1220] border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    <span>Mensaje Pre-redactado para el Reclutador</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-semibold">
                    Listo para Enviar
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono">
                  "{rawWhatsAppText}"
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(rawWhatsAppText, 'message')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedMessage ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">¡Texto Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Mensaje</span>
                      </>
                    )}
                  </button>

                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-950 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Abrir Chat en WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Vías Oficiales de Contacto */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Canales Digitales Oficiales Verificados
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {place.computrabajoUrl && (
                    <a
                      href={place.computrabajoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-800/40 text-red-300 flex items-center justify-between transition"
                    >
                      <span className="font-semibold flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span>CompuTrabajo Venezuela</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {place.linkedinUrl && (
                    <a
                      href={place.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-blue-950/30 hover:bg-blue-900/40 border border-blue-800/40 text-blue-300 flex items-center justify-between transition"
                    >
                      <span className="font-semibold flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-400" />
                        <span>LinkedIn Corporativo</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {place.instagramUrl && (
                    <a
                      href={place.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-pink-950/30 hover:bg-pink-900/40 border border-pink-800/40 text-pink-300 flex items-center justify-between transition"
                    >
                      <span className="font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-pink-400" />
                        <span>Instagram Convocatorias</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {place.contactEmail && (
                    <a
                      href={`mailto:${place.contactEmail}?subject=Postulaci%C3%B3n%20-%20${encodeURIComponent(place.title || 'Vacante')}&body=${encodeURIComponent(rawWhatsAppText)}`}
                      className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center justify-between transition"
                    >
                      <span className="font-semibold flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-400" />
                        <span>Enviar CV por Correo</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Instrucciones de Postulación Presencial */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs text-slate-300">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Si vas a postularte presencialmente en tienda:</span>
                </p>
                <p className="leading-relaxed">
                  {place.applyInstructions || 'Acércate en la mañana entre 8:30 AM y 11:30 AM y pregunta en la taquilla de atención al cliente por el Administrador o Gerente de Turno.'}
                </p>
              </div>
            </div>
          )}

          {/* =========================================================================
              PESTAÑA 4: PROTOCOLO DE SEGURIDAD LABORAL (CHAMBASEGURA 🛡️)
              ========================================================================= */}
          {activeTab === 'safety' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>Compromiso de Seguridad Anti-Estafas en ChambaCerca</span>
                </div>
                <p className="leading-relaxed text-slate-300">
                  En Venezuela proliferan falsas ofertas de empleo que piden pagos por exámenes médicos, uniformes o capacitaciones antes de firmar. En <strong>ChambaCerca</strong> auditamos canales oficiales para garantizar que ninguna empresa cobre por postularte.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Postulación 100% Gratuita</span>
                  </p>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Las empresas serias asumen todos los costos de dotación y selección de personal.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Canales de RRHH Auditados</span>
                  </p>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Números de WhatsApp y correos pertenecen a dominios corporativos registrados.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Ubicación Física Real</span>
                  </p>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Cada comercio tiene coordenadas exactas y ficha verificada en Google Maps.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Reporte Vecinal Inmediato</span>
                  </p>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Si una vacante ya fue ocupada o te piden dinero, puedes reportarla y el sistema la desactiva.
                  </p>
                </div>
              </div>

              {/* Botón de Reporte Vecinal */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 flex items-center justify-between gap-3">
                <div className="text-xs">
                  <p className="font-bold text-rose-300">¿Notaste alguna irregularidad con este puesto?</p>
                  <p className="text-[11px] text-slate-400">Ayuda a la comunidad reportando vacantes inactivas o cobros.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenReport(place);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shrink-0 cursor-pointer"
                >
                  Reportar Oferta
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Acciones del pie fijas */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/95 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenReport(place);
            }}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-amber-300 hover:bg-amber-950/30 rounded-xl transition border border-transparent hover:border-amber-800/40 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            📢 Fui a preguntar (Aportar dato vecinal)
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Botón Avisar a un Pana por WhatsApp */}
            <button
              type="button"
              onClick={() => {
                const title = place.title || 'esta vacante';
                const name = place.placeName;
                const address = place.address || '';
                const salary = place.salaryRange ? `Pagan *${place.salaryRange}*` : 'Excelente paquete en $ USD';
                const walk = place.walkTimeMinutes ? `Queda a *${place.walkTimeMinutes} min a pie*` : '';
                const message = `¡Epa chamo! 👋 En ChambaCerca vi esta oportunidad de trabajo:\n\n💼 *${title}*\n🏬 *${name}* (${address})\n💰 ${salary}\n🚶‍♂️ ${walk}\n\nRevisa los detalles aquí 👇\nhttps://portafolios-rho.vercel.app`;
                window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
              }}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-slate-700/80 cursor-pointer"
              title="Compartir vacante con un amigo o familiar por WhatsApp"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Avisar a un pana</span>
            </button>

            <a
              href={googleMapsWalkingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Caminar ({place.walkTimeMinutes} min)</span>
            </a>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-950 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp Directo</span>
              </a>
            )}

            {place.computrabajoUrl && (
              <a
                href={place.computrabajoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                <span>CompuTrabajo</span>
              </a>
            )}

            {place.contactPhone && !whatsappUrl && (
              <a
                href={`tel:${place.contactPhone}`}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Llamar a RRHH</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
