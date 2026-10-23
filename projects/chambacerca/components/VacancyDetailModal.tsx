'use client';

import { PlaceResultItem } from '@/app/api/places/route';
import { 
  X, MapPin, Clock, DollarSign, CheckCircle2, MessageCircle, 
  Phone, AlertTriangle, FileText, UserCheck, Navigation, ExternalLink,
  Mail, ShieldCheck, Globe, Briefcase, Share2
} from 'lucide-react';

interface VacancyDetailModalProps {
  place: PlaceResultItem | null;
  onClose: () => void;
  onOpenReport: (place: PlaceResultItem) => void;
}

export default function VacancyDetailModal({ place, onClose, onOpenReport }: VacancyDetailModalProps) {
  if (!place) return null;

  // Enlace pre-armado de WhatsApp profesional y respetuoso
  const whatsappMessage = encodeURIComponent(
    `Hola, buenos días. Vi en ChambaCerca que en ${place.placeName} tienen vacante activa para "${place.title || 'el puesto'}". Quisiera postularme formalmente. ¿A qué hora o con quién podría consignar mi síntesis curricular? Muchas gracias.`
  );
  const whatsappUrl = place.contactWhatsapp
    ? `https://wa.me/${place.contactWhatsapp.replace(/\D/g, '')}?text=${whatsappMessage}`
    : null;

  // Enlaces de Google Maps
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
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {place.isOfficiallyVerified ? 'Canal Oficial Verificado' : 'Vacante Activa'}
                </span>
                <span className="text-xs text-slate-400">
                  {place.categoryLabel}
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  • A {place.distanceFormatted} ({place.walkTimeMinutes} min a pie)
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
          {/* Canales Oficiales Verificados (CompuTrabajo, LinkedIn, Instagram, Web) */}
          {(place.computrabajoUrl || place.linkedinUrl || place.instagramUrl || place.portalUrl || place.contactEmail) && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Vías Oficiales de Postulación
                </h4>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">100% Verificado</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {place.computrabajoUrl && (
                  <a
                    href={place.computrabajoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/60 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Ver en CompuTrabajo</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}

                {place.linkedinUrl && (
                  <a
                    href={place.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                    <span>LinkedIn Oficial</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}

                {place.instagramUrl && (
                  <a
                    href={place.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-pink-950/50 hover:bg-pink-900/60 text-pink-300 border border-pink-800/60 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    <span>Instagram / Convocatorias</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}

                {place.portalUrl && (
                  <a
                    href={place.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Globe className="w-3.5 h-3.5 text-teal-400" />
                    <span>Portal de Empleo Web</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}

                {place.contactEmail && (
                  <a
                    href={`mailto:${place.contactEmail}?subject=Postulaci%C3%B3n%20Laboral%20-%20${encodeURIComponent(place.title || 'Vacante')}&body=Estimado%20equipo%20de%20Talento%20Humano%2C%0A%0AAdjunto%20mi%20s%C3%ADntesis%20curricular%20para%20la%20vacante%20disponible.%0A%0AMuchas%20gracias.`}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enviar CV por Correo ({place.contactEmail})</span>
                  </a>
                )}
              </div>
            </div>
          )}

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
                    <p className="text-xs text-slate-400 font-medium">Remuneración estimada</p>
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
                    <p className="text-xs text-slate-400 font-medium">Jornada / Horario</p>
                    <p className="font-bold text-slate-200 text-sm">{place.schedule}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Alerta Anti-Estafas Oficial en Venezuela */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">Aviso de Seguridad Laboral (100% Gratuito):</p>
              <p className="mt-0.5 text-amber-200/90 leading-relaxed">
                Ninguna empresa formal en Venezuela cobra dinero por procesos de contratación, exámenes médicos, uniformes ni entrevistas. Postúlate siempre a través de los canales oficiales mostrados arriba o directamente en la sede física.
              </p>
            </div>
          </div>

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

          {/* Instrucciones de Postulación */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-800/40">
            <h3 className="text-sm font-bold text-emerald-300 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Instrucciones para postularte
            </h3>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              {place.applyInstructions || 'Acércate en horario de la mañana con tu carpeta de documentos en mano.'}
            </p>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs text-slate-300">
              <p className="font-bold text-slate-200">Recomendaciones indispensables al acudir:</p>
              <p>📄 Lleva 2 copias de tu Cédula de Identidad, copia de RIF del SENIAT y tu Síntesis Curricular (1 página).</p>
              <p>⏰ Acude antes de las 11:30 AM para coincidir con el Gerente de Turno o el Encargado de Tienda.</p>
              <p>🤝 Presentación limpia, vestimenta formal/casual y trato cordial.</p>
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

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
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
                <MessageCircle className="w-4 h-4" /> WhatsApp Oficial
              </a>
            )}

            {place.computrabajoUrl && (
              <a
                href={place.computrabajoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Briefcase className="w-4 h-4" /> CompuTrabajo
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
