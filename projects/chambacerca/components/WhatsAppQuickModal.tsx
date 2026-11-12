'use client';

import React, { useState, useEffect } from 'react';
import { PlaceResultItem } from '@/app/api/places/route';
import { ApplicantProfile } from '@/components/ApplicantProfileModal';
import { 
  MessageCircle, Copy, Check, Phone, ShieldCheck, X, 
  Send, Edit3, BookmarkCheck, Sparkles, AlertCircle, ExternalLink 
} from 'lucide-react';

interface WhatsAppQuickModalProps {
  place: PlaceResultItem | null;
  isOpen: boolean;
  onClose: () => void;
  applicantProfile?: ApplicantProfile | null;
  onApplied?: (place: PlaceResultItem) => void;
  isDemoUser?: boolean;
}

export default function WhatsAppQuickModal({
  place,
  isOpen,
  onClose,
  applicantProfile,
  onApplied,
  isDemoUser = false
}: WhatsAppQuickModalProps) {
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [hasAppliedRoute, setHasAppliedRoute] = useState(false);
  const [openAttempted, setOpenAttempted] = useState(false);
  const [storedProfile, setStoredProfile] = useState<ApplicantProfile | null>(null);

  // Cargar perfil local como respaldo
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('chambacerca_applicant_profile');
        if (saved) setStoredProfile(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const effectiveProfile = applicantProfile || storedProfile;

  // Generar mensaje reactivo síncrono para que nunca esté vacío
  const defaultMsg = place ? (
    effectiveProfile?.fullName
      ? `Hola, cordial saludo. Mi nombre es ${effectiveProfile.fullName}${effectiveProfile.idNumber ? ` (C.I. ${effectiveProfile.idNumber})` : ''}. Vi en ChambaCerca su vacante para "${place.title || 'el puesto publicado'}". Cuento con experiencia${effectiveProfile.targetRole ? ` como ${effectiveProfile.targetRole}` : ''} y disponibilidad inmediata. ¿En qué horario o por qué vía podría consignar mi síntesis curricular? Muchas gracias.`
      : `Hola, cordial saludo. Vi en ChambaCerca que en ${place.placeName} tienen vacante activa para "${place.title || 'el puesto publicado'}". Cumplo con los requisitos y quisiera consignar mi síntesis curricular. ¿Con quién o en qué horario podría presentarme? Muchas gracias.`
  ) : '';

  const messageToDisplay = customMessage || defaultMsg;

  useEffect(() => {
    if (place) {
      setHasAppliedRoute(Boolean(place.isClaimed));
      setOpenAttempted(false);
      setCopiedNumber(false);
      setCopiedMessage(false);
      setIsEditing(false);
    }
  }, [place]);

  if (!isOpen || !place) return null;

  // Formatear número de teléfono (por ejemplo +58 412-5556677)
  const rawDigits = (place.contactWhatsapp || place.contactPhone || '').replace(/\D/g, '');
  let formattedPhone = place.contactWhatsapp || place.contactPhone || 'Número no disponible';
  
  if (rawDigits.startsWith('58') && rawDigits.length >= 11) {
    const area = rawDigits.substring(2, 5);
    const mid = rawDigits.substring(5, 8);
    const end = rawDigits.substring(8);
    formattedPhone = `+58 ${area} ${mid}-${end}`;
  } else if (rawDigits.startsWith('0') && rawDigits.length >= 10) {
    const area = rawDigits.substring(1, 4);
    const mid = rawDigits.substring(4, 7);
    const end = rawDigits.substring(7);
    formattedPhone = `+58 ${area} ${mid}-${end}`;
  }

  const phoneForWhatsApp = rawDigits.startsWith('58') 
    ? rawDigits 
    : rawDigits.startsWith('0') 
      ? `58${rawDigits.substring(1)}` 
      : rawDigits ? `58${rawDigits}` : '';

  // Copiar número al portapapeles
  const handleCopyNumber = () => {
    const numToCopy = rawDigits.startsWith('58') ? `+${rawDigits}` : `+58${rawDigits.replace(/^0/, '')}`;
    navigator.clipboard.writeText(numToCopy || formattedPhone);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2200);
  };

  // Copiar mensaje al portapapeles
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageToDisplay);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2200);
  };

  // Guardar en Mi Ruta
  const handleRegisterRoute = () => {
    if (onApplied && place) {
      onApplied(place);
      setHasAppliedRoute(true);
    }
  };

  // Abrir en la app de WhatsApp solo si el usuario lo desea expresamente
  const handleLaunchWhatsApp = () => {
    // 1. Siempre asegurar copia del mensaje en el portapapeles
    navigator.clipboard.writeText(messageToDisplay);
    handleRegisterRoute();
    setOpenAttempted(true);

    if (!phoneForWhatsApp) {
      handleCopyMessage();
      return;
    }

    // 2. Intentar lanzar directamente el protocolo de la app nativa de WhatsApp
    // sin redirigir a páginas web externas ni abrir Google Chrome
    try {
      const intentUrl = `whatsapp://send?phone=${phoneForWhatsApp}&text=${encodeURIComponent(messageToDisplay)}`;
      const link = document.createElement('a');
      link.href = intentUrl;
      // No usar target _blank para no abrir pestañas en navegadores web
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.warn('No se pudo invocar protocolo nativo whatsapp://', e);
    }
  };

  const handleCopyAndApply = () => {
    navigator.clipboard.writeText(messageToDisplay);
    setCopiedMessage(true);
    handleRegisterRoute();
    setOpenAttempted(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-[1300] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[#0B141A] border-t sm:border border-emerald-500/30 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-emerald-950/60 flex flex-col max-h-[92vh] overflow-hidden text-slate-100 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra móvil táctil superior */}
        <div className="w-12 h-1.5 bg-slate-700/60 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

        {/* Encabezado estilo WhatsApp Pro */}
        <div className="px-5 py-4 border-b border-emerald-500/20 bg-gradient-to-r from-[#0d2218] via-[#0B141A] to-[#0A1A14] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950">
              <MessageCircle className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] text-black font-bold">
                ✓
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Contacto de Selección
                </span>
                <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-1.5 py-0.5 rounded-full font-mono">
                  En Línea
                </span>
              </div>
              <h3 className="text-base font-bold text-white truncate leading-tight">
                {place.placeName}
              </h3>
              <p className="text-xs text-slate-400 truncate">
                {place.title || 'Vacante Disponible'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700/60 shrink-0"
            aria-label="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar">

          {/* Tarjeta de Número de Contacto Oficial */}
          <div className="p-3.5 rounded-2xl bg-[#111B21] border border-emerald-500/20 shadow-inner flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Línea Directa de RRHH
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-mono font-bold text-white tracking-wide">
                  {formattedPhone}
                </span>
              </div>
              <span className="text-[11px] text-emerald-400/90 flex items-center gap-1 mt-0.5 font-medium">
                <Check className="w-3 h-3" />
                Número oficial verificado para postulaciones
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyNumber}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  copiedNumber 
                    ? 'bg-emerald-500 text-black' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
                title="Copiar número de teléfono"
              >
                {copiedNumber ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Número</span>
                  </>
                )}
              </button>

              {rawDigits && (
                <a
                  href={`tel:+${rawDigits.startsWith('58') ? rawDigits : `58${rawDigits.replace(/^0/, '')}`}`}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                  title="Llamar directo por teléfono"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Simulador de Chat WhatsApp con Mensaje Pre-redactado */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Mensaje de postulación listo:
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!isEditing && !customMessage) {
                    setCustomMessage(defaultMsg);
                  }
                  setIsEditing(!isEditing);
                }}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px] font-bold underline-offset-2 hover:underline"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditing ? 'Listo (Ver burbuja)' : 'Editar mensaje'}</span>
              </button>
            </div>

            {/* Burbuja estilo WhatsApp Dark */}
            <div className="p-4 rounded-2xl bg-[#111B21] border border-slate-800 relative">
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={messageToDisplay}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={4}
                    className="w-full bg-[#0B141A] border border-emerald-500/40 rounded-xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none font-sans"
                    placeholder="Escribe tu mensaje de postulación..."
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                    >
                      Guardar texto
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Globo de mensaje verde WhatsApp (#005C4B) */}
                  <div className="bg-[#005C4B] text-slate-100 p-3.5 rounded-2xl rounded-tr-none shadow-md border border-emerald-400/20 text-xs sm:text-[13px] leading-relaxed relative font-sans">
                    <p className="whitespace-pre-wrap text-white font-medium">{messageToDisplay}</p>
                    <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-emerald-200/80 font-mono">
                      <span>Ahora</span>
                      <span className="text-emerald-300 font-bold">✓✓</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón rápido de copiar dentro del chat */}
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  {effectiveProfile?.fullName 
                    ? `Personalizado con tu perfil (${effectiveProfile.fullName})` 
                    : 'Personalizado para esta vacante'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    copiedMessage
                      ? 'bg-emerald-500 text-black'
                      : 'bg-[#202C33] hover:bg-[#2A3942] text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {copiedMessage ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>¡Mensaje Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Mensaje</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Aviso informativo de navegación segura */}
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-slate-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-emerald-300">Mini Ventana In-App:</strong> Tu mensaje está listo y personalizado. Puedes copiarlo y registrarlo en <strong className="text-amber-300">Mi Ruta</strong> directamente sin salir de la app, o abrir tu app de WhatsApp.
            </p>
          </div>

          {openAttempted && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-400/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                ¡Listo! Mensaje copiado al portapapeles y vacante registrada en tu lista <strong>Mi Ruta</strong>.
              </span>
            </div>
          )}
        </div>

        {/* Acciones principales fijas al pie de la mini ventana */}
        <div className="p-4 border-t border-emerald-500/20 bg-[#0B141A] flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          {/* Botón 1: Copiar y Guardar en Mi Ruta (Sin salir de la app) */}
          <button
            type="button"
            onClick={handleCopyAndApply}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/80 transition cursor-pointer active:scale-[0.98]"
          >
            {copiedMessage ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>¡Mensaje Copiado y Guardado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Mensaje y Anotar en Mi Ruta</span>
              </>
            )}
          </button>

          {/* Botón 2: Abrir App WhatsApp */}
          <button
            type="button"
            onClick={handleLaunchWhatsApp}
            className="w-full sm:w-auto py-3 px-3.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/40 transition cursor-pointer"
            title="Intentar abrir la app nativa de WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>Abrir en WhatsApp</span>
          </button>

          {/* Botón 3: Cerrar */}
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-medium text-xs border border-slate-800 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
