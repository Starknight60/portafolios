'use client';

import { useState, useEffect } from 'react';
import { 
  X, User, Phone, Briefcase, Award, CheckCircle2, 
  Sparkles, MessageCircle, Save, FileText, Check, ShieldCheck
} from 'lucide-react';

export interface ApplicantProfile {
  fullName: string;
  idNumber: string;
  phone: string;
  targetRole: string;
  experienceSummary: string;
  educationLevel?: string;
}

interface ApplicantProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: ApplicantProfile) => void;
}

const COMMON_ROLES = [
  { label: '🛒 Cajero / Atención', role: 'Cajero / Atención al Cliente', desc: 'Manejo de caja, punto de venta y servicio cordial al cliente.' },
  { label: '📦 Almacén / Pasillero', role: 'Almacén / Pasillero / Repositor', desc: 'Recepción, inventario, carga y orden en anaqueles y depósito.' },
  { label: '🍳 Cocina / Comida', role: 'Auxiliar de Cocina / Cafetería', desc: 'Manipulación de alimentos, preparación y limpieza en sala.' },
  { label: '🛵 Reparto / Delivery', role: 'Repartidor / Motorizado / Despacho', desc: 'Rutas locales, entregas puntuales y atención cordial.' },
  { label: '🧹 Mantenimiento', role: 'Auxiliar de Limpieza / Mantenimiento', desc: 'Mantenimiento preventivo, orden y desinfección de instalaciones.' },
  { label: '🌟 Primer Empleo', role: 'Auxiliar General / Primer Empleo', desc: 'Joven proactivo con rápida capacidad de aprendizaje y alta puntualidad.' },
];

export default function ApplicantProfileModal({
  isOpen,
  onClose,
  onProfileUpdated,
}: ApplicantProfileModalProps) {
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Cargar perfil guardado desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('chambacerca_applicant_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.fullName) setFullName(parsed.fullName);
          if (parsed.idNumber) setIdNumber(parsed.idNumber);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.targetRole) setTargetRole(parsed.targetRole);
          if (parsed.experienceSummary) setExperienceSummary(parsed.experienceSummary);
        } else {
          // Intentar rescatar del generador de CV si existía
          const cvSaved = localStorage.getItem('chambacerca_cv_data');
          if (cvSaved) {
            const cv = JSON.parse(cvSaved);
            if (cv.fullName) setFullName(cv.fullName);
            if (cv.idNumber) setIdNumber(cv.idNumber);
            if (cv.phone) setPhone(cv.phone);
            if (cv.targetRole) setTargetRole(cv.targetRole);
            if (cv.aboutMe) setExperienceSummary(cv.aboutMe);
          }
        }
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const profile: ApplicantProfile = {
      fullName: fullName.trim(),
      idNumber: idNumber.trim(),
      phone: phone.trim(),
      targetRole: targetRole.trim(),
      experienceSummary: experienceSummary.trim(),
    };

    try {
      localStorage.setItem('chambacerca_applicant_profile', JSON.stringify(profile));
      
      // Sincronizar también con la base del CV para comodidad del postulante
      const cvSaved = localStorage.getItem('chambacerca_cv_data');
      const cvData = cvSaved ? JSON.parse(cvSaved) : {};
      localStorage.setItem('chambacerca_cv_data', JSON.stringify({
        ...cvData,
        fullName: profile.fullName || cvData.fullName,
        idNumber: profile.idNumber || cvData.idNumber,
        phone: profile.phone || cvData.phone,
        targetRole: profile.targetRole || cvData.targetRole,
        aboutMe: profile.experienceSummary || cvData.aboutMe,
      }));

      setSavedSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated(profile);
      }
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch (e) {
      console.error(e);
    }
  };

  const samplePreviewText = `Hola, cordial saludo. Mi nombre es *${fullName || '[Tu Nombre]'}* (C.I. *${idNumber || 'V-XXXXXXXX'}*).
Vi en ChambaCerca que tienen vacante para *Panadería / Comercio*. Cuento con experiencia como *${targetRole || 'Personal de Tienda'}* y disponibilidad inmediata.
¿En qué horario podría consignar mi síntesis curricular en físico o comunicarme con RRHH? Quedo a su orden al *${phone || 'mi teléfono'}*. ¡Muchas gracias!`;

  return (
    <div className="fixed inset-0 z-[1400] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl max-h-[92vh] bg-[#0A101C] border-t sm:border border-emerald-500/40 rounded-t-3xl sm:rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.25)] flex flex-col overflow-hidden text-slate-100 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Manija de Arrastre Táctil para Móviles */}
        <div className="w-12 h-1.5 rounded-full bg-slate-700/80 mx-auto mt-2.5 mb-0.5 sm:hidden shrink-0" />

        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-gradient-to-r from-emerald-950/60 via-[#0C1527] to-[#0A101C] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <User className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Mi Perfil de Postulante Rápido</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-500 text-slate-950 rounded-full font-mono">
                  AUTO-LLENADO
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Guarda tus datos una sola vez. Las postulaciones por WhatsApp se personalizarán con tu nombre automáticamente.
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

        {/* Cuerpo del Formulario */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[calc(92vh-140px)]">
          {/* Roles de 1 Clic */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Selecciona tu Oficio o Área Principal (1 Clic):</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {COMMON_ROLES.map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => {
                    setTargetRole(r.role);
                    if (!experienceSummary) {
                      setExperienceSummary(r.desc);
                    }
                  }}
                  className={`p-2 rounded-xl text-left text-xs font-semibold border transition cursor-pointer ${
                    targetRole === r.role
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <p className="font-bold text-[11px] leading-tight">{r.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Formulario de Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre y Apellido *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Carlos Mendoza"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cédula de Identidad (V / E)
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Ej: V-25.123.456"
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Teléfono / WhatsApp de Contacto *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 0412-1234567"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cargo / Ocupación Preferida
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Ej: Cajero / Despacho / Ventas"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Breve Experiencia o Síntesis Laboral
            </label>
            <textarea
              rows={2}
              value={experienceSummary}
              onChange={(e) => setExperienceSummary(e.target.value)}
              placeholder="Ej: 2 años de experiencia en atención al cliente y manejo de punto de venta. Puntual, responsable y con disponibilidad inmediata."
              className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Vista previa en vivo del mensaje de WhatsApp */}
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-2">
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Así te leerán los comercios cuando toques "Postularme por WhatsApp":</span>
            </span>
            <div className="p-3 rounded-xl bg-slate-900 text-[11px] text-slate-200 font-mono leading-relaxed border border-slate-800 whitespace-pre-line">
              {samplePreviewText}
            </div>
          </div>
        </div>

        {/* Footer con Botón Guardar */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#0B1320] safe-area-bottom flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tus datos se guardan de forma privada en tu propio teléfono o navegador.</span>
          </p>

          <button
            type="button"
            onClick={handleSave}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg ${
              savedSuccess
                ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_#10B981]'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Perfil Guardado!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Mi Perfil</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
