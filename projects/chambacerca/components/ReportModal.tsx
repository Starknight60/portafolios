'use client';

import { useState } from 'react';
import { PlaceResultItem } from '@/app/api/places/route';
import { X, CheckCircle, AlertCircle, Send, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ReportModalProps {
  place: PlaceResultItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportModal({ place, onClose, onSuccess }: ReportModalProps) {
  const [status, setStatus] = useState<'HIRING' | 'NOT_HIRING'>('HIRING');
  const [roleHiring, setRoleHiring] = useState('');
  const [comment, setComment] = useState('');
  const [contactTip, setContactTip] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!place) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!place) return;
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeOsmId: place.id,
          placeName: place.placeName,
          category: place.category,
          latitude: place.latitude,
          longitude: place.longitude,
          status,
          roleHiring: status === 'HIRING' ? roleHiring : null,
          comment: comment.trim() || null,
          contactTip: contactTip.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar reporte');
      }

      setSuccessMsg(data.message || 'Reporte registrado con éxito.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-[#0E1726] border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/40">
              Aporte Comunitario Anónimo
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              ¿Fuiste a preguntar a {place.placeName}?
            </h3>
            <p className="text-xs text-slate-400">
              Ayuda a otras personas desempleadas compartiendo información real de contratación.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-800">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-emerald-300">¡Muchas gracias por colaborar!</h4>
            <p className="text-xs text-slate-300">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                ¿Están buscando personal actualmente?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('HIRING')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    status === 'HIRING'
                      ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-950'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4 text-emerald-400" /> Sí, están buscando
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('NOT_HIRING')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    status === 'NOT_HIRING'
                      ? 'bg-rose-950/70 border-rose-500 text-rose-300 shadow-lg shadow-rose-950'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4 text-rose-400" /> No tienen vacantes
                </button>
              </div>
            </div>

            {status === 'HIRING' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ¿Para qué cargo o función? (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cajero, ayudante de mostrador, vigilante..."
                  value={roleHiring}
                  onChange={(e) => setRoleHiring(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ¿Qué te dijeron o qué viste? (Comentario)
              </label>
              <textarea
                rows={2}
                placeholder="Ej: Tienen un aviso pegado en la puerta, o me dijeron que llevara CV el lunes..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Consejo para quien vaya a preguntar (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: Preguntar por la Sra. Carmen en la caja 2 antes de las 11 AM..."
                value={contactTip}
                onChange={(e) => setContactTip(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Guardando...' : 'Publicar Aporte'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
