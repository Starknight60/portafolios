'use client';

import { PlaceResultItem } from '@/app/api/places/route';
import { 
  X, MapPin, Clock, DollarSign, CheckCircle2, MessageCircle, 
  Phone, AlertTriangle, FileText, UserCheck, Navigation, ExternalLink,
  Compass, Eye
} from 'lucide-react';

interface VacancyDetailModalProps {
  place: PlaceResultItem | null;
  onClose: () => void;
  onOpenReport: (place: PlaceResultItem) => void;
}

export default function VacancyDetailModal({ place, onClose, onOpenReport }: VacancyDetailModalProps) {
  if (!place) return null;

  // Enlace pre-armado de WhatsApp con mensaje educado y profesional
  const whatsappMessage = encodeURIComponent(
    `Hola, buenos días. Vi en ChambaCerca que en ${place.placeName} tienen disponible la vacante para "${place.title || 'el puesto'}". ¿A qué hora o con quién podría acercarme para consignar mi síntesis curricular? Muchas gracias.`
  );
  const whatsappUrl = place.contactWhatsapp
    ? `https://wa.me/${place.contactWhatsapp.replace(/\D/g, '')}?text=${whatsappMessage}`
    : null;

  // Enlaces directos a Google Maps
  const googleMapsPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.placeName} ${place.address}`)}`;
  const googleMapsWalkingUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&travelmode=walking`;
  const googleStreetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${place.latitude},${place.longitude}`;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] bg-[#0E1726] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/80 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl sm:text-4xl p-2 rounded-xl bg-slate-800 border border-slate-700">
              {place.categoryIcon}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  {place.status === 'VERIFIED_VACANCY' ? '✓ Vacante Activa' : place.status === 'COMMUNITY_HIRING' ? '📢 Reporte Vecinal' : '🏬 Comercio Real'}
                </span>
                <span className="text-xs text-slate-400">
                  {place.categoryLabel}
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  • A {place.distanceFormatted} ({place.walkTimeMinutes} min caminando)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                {place.title || place.placeName}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-300 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{place.placeName}</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{place.address}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* Accesos rápidos Google Maps */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-extrabold text-sm">G</span>
              <span className="text-xs font-bold text-slate-200">Google Maps:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={googleMapsPlaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-blue-950/70 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 text-xs font-medium flex items-center gap-1 transition"
              >
                <span>Ficha en Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={googleStreetViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition"
              >
                <Eye className="w-3 h-3 text-amber-400" />
                <span>Fachada Street View</span>
              </a>

              <a
                href={googleMapsWalkingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-xs font-medium flex items-center gap-1 transition"
              >
                <Navigation className="w-3 h-3 text-emerald-400" />
                <span>Ruta a pie ({place.walkTimeMinutes} min)</span>
              </a>
            </div>
          </div>

          {/* Tarjetas de Remuneración y Horario */}
          {(place.salaryRange || place.schedule) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {place.salaryRange && (
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-900/50 text-emerald-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Remuneración informada</p>
                    <p className="font-bold text-emerald-300 text-sm">{place.salaryRange}</p>
                  </div>
                </div>
              )}
              {place.schedule && (
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-700/60 text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Jornada y Turno</p>
                    <p className="font-bold text-slate-200 text-sm">{place.schedule}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Descripción */}
          {place.description && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Detalle del puesto
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
                {place.description}
              </p>
            </div>
          )}

          {/* Requisitos y Beneficios */}
          {((place.requirements && place.requirements.length > 0) || (place.benefits && place.benefits.length > 0)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {place.requirements && place.requirements.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" /> Requisitos solicitados
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {place.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {place.benefits && place.benefits.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Beneficios ofrecidos
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {place.benefits.map((ben, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{ben}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Guía práctica para solicitar el empleo con éxito */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-800/40">
            <h3 className="text-sm font-bold text-emerald-300 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Instrucciones para postularte
            </h3>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              {place.applyInstructions || 'Acércate en horario de la mañana con tu carpeta de documentos en mano.'}
            </p>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs text-slate-300">
              <p className="font-bold text-slate-200">Recomendaciones presenciales para el buscador de empleo:</p>
              <p>📄 Lleva 2 copias de tu Cédula de Identidad, copia de RIF del SENIAT y tu Síntesis Curricular (1 página).</p>
              <p>⏰ Acude antes del mediodía para encontrar al Gerente de Turno o Jefe de Personal.</p>
              <p>🤝 Presentación limpia, ropa formal/casual sobria y saludo respetuoso.</p>
            </div>
          </div>

          {/* Comentario comunitario si existe */}
          {place.recentComment && (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Aporte reciente de un vecino:
              </p>
              <p className="italic">"{place.recentComment}"</p>
              {place.contactTip && (
                <p className="mt-1.5 font-medium text-amber-300">💡 Consejo de contacto: {place.contactTip}</p>
              )}
            </div>
          )}
        </div>

        {/* Acciones del pie */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenReport(place);
            }}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-amber-300 hover:bg-amber-950/30 rounded-xl transition border border-transparent hover:border-amber-800/40 flex items-center justify-center gap-1.5"
          >
            📢 Fui a preguntar (Aportar dato)
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={googleMapsWalkingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Navigation className="w-4 h-4 text-emerald-400" /> Ruta a pie en Google Maps
            </a>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-950"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp directo
              </a>
            )}

            {place.contactPhone && !whatsappUrl && (
              <a
                href={`tel:${place.contactPhone}`}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Phone className="w-4 h-4" /> Llamar
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
