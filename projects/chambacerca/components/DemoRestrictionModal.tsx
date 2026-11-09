'use client';

import { X, Lock, LogIn, UserPlus, Sparkles, ArrowRight } from 'lucide-react';
import { playTacticalClick } from '@/lib/audio';

interface DemoRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  userEmail?: string | null;
  reason?: 'message' | 'contact_info' | 'publish' | 'report' | 'general';
}

export default function DemoRestrictionModal({
  isOpen,
  onClose,
  onOpenLogin,
  onOpenRegister,
  userEmail,
  reason = 'general',
}: DemoRestrictionModalProps) {
  if (!isOpen) return null;

  const reasonTitles: Record<string, { title: string; subtitle: string }> = {
    message: {
      title: 'Enviar Mensajes o Postulaciones',
      subtitle: 'Para contactar directamente a los empleadores o enviar tu postulación por WhatsApp, necesitas una cuenta activa.',
    },
    contact_info: {
      title: 'Ver Información de la Vacante',
      subtitle: 'Para consultar la información detallada de la oferta, sueldo exacto, dirección y datos de contacto de RRHH, debes iniciar sesión o crear una cuenta.',
    },
    publish: {
      title: 'Publicar Ofertas de Empleo',
      subtitle: 'Para crear convocatorias y recibir postulantes en tu negocio, ingresa con tu cuenta de empresa o como Administrador.',
    },
    report: {
      title: 'Reportar o Moderar Vacante',
      subtitle: 'Para enviar alertas o reportes sobre comercios a la comunidad, debes tener una cuenta identificada.',
    },
    general: {
      title: 'Función en Modo Demostración',
      subtitle: 'Las cuentas de prueba son exclusivamente para visualizar y explorar el radar de vacantes.',
    },
  };

  const currentReason = reasonTitles[reason] || reasonTitles.general;

  return (
    <div 
      className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#0D1524] border border-amber-500/40 rounded-3xl shadow-2xl shadow-black/80 p-6 text-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambiental */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Botón de Cierre */}
        <button
          onClick={() => {
            playTacticalClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer border border-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado con Icono de Bloqueo */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/50 shrink-0">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
              Modo Demostración (Solo Ver)
            </span>
            <h3 className="text-base font-extrabold text-white mt-1">
              {currentReason.title}
            </h3>
          </div>
        </div>

        {/* Mensaje descriptivo */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-5 space-y-2 text-xs leading-relaxed text-slate-300">
          <p>
            {userEmail ? (
              <>
                Estás navegando con la cuenta de prueba <strong className="text-emerald-400 font-mono">{userEmail}</strong>.
              </>
            ) : (
              'Estás explorando en modo invitado.'
            )}{' '}
            Esta cuenta está habilitada únicamente para <strong>ver las ofertas y su ubicación</strong>.
          </p>
          <p className="text-slate-400">
            {currentReason.subtitle}
          </p>
          <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2 text-[11px] font-semibold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span>Debes iniciar sesión con tu cuenta personal o crear una cuenta gratis para poder empezar a trabajar con la página.</span>
          </div>
        </div>

        {/* Acciones Principales */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              playTacticalClick();
              onClose();
              onOpenLogin();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Iniciar Sesión con mi Cuenta</span>
            <ArrowRight className="w-3.5 h-3.5 ml-auto" />
          </button>

          <button
            type="button"
            onClick={() => {
              playTacticalClick();
              onClose();
              onOpenRegister();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>Crear Cuenta Gratuita (1 Minuto)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTacticalClick();
              onClose();
            }}
            className="w-full py-2 text-center text-xs font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            Continuar explorando en modo prueba
          </button>
        </div>
      </div>
    </div>
  );
}
