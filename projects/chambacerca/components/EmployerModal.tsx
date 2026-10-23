'use client';

import { useState } from 'react';
import { X, Briefcase, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { CATEGORIES, BASE_CATEGORIES } from '@/lib/categories';

interface EmployerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoords: { lat: number; lng: number };
  onVacancyCreated: () => void;
}

export default function EmployerModal({ isOpen, onClose, userCoords, onVacancyCreated }: EmployerModalProps) {
  const [title, setTitle] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [category, setCategory] = useState('store');
  const [address, setAddress] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [schedule, setSchedule] = useState('');
  const [description, setDescription] = useState('');
  const [howToApply, setHowToApply] = useState<'IN_PERSON' | 'WHATSAPP' | 'PHONE'>('IN_PERSON');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [applyInstructions, setApplyInstructions] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const requirements = requirementsText
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

      const benefits = benefitsText
        .split('\n')
        .map((b) => b.trim())
        .filter(Boolean);

      const res = await fetch('/api/vacancies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          placeName,
          category,
          address: address || 'Ubicación céntrica comercial',
          latitude: userCoords.lat,
          longitude: userCoords.lng,
          jobType: 'FULL_TIME',
          schedule: schedule || null,
          salaryRange: salaryRange || null,
          description: description || `Oportunidad laboral para el cargo de ${title} en ${placeName}.`,
          howToApply,
          contactWhatsapp: contactWhatsapp || null,
          contactPhone: contactPhone || null,
          applyInstructions: applyInstructions || null,
          requirements,
          benefits,
          daysActive: 30,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al publicar vacante');
      }

      setSuccessMsg(data.message || 'Vacante publicada exitosamente.');
      setTimeout(() => {
        onVacancyCreated();
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] bg-[#0E1726] border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Publicar Oportunidad Laboral</h3>
              <p className="text-xs text-slate-400">Publicación directa visible en el radar de proximidad</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-800">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-emerald-300">¡Vacante Activa en el Radar!</h4>
            <p className="text-xs text-slate-300">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Puesto o Título de la Vacante *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cajero, Asistente, Mesero..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre del Comercio o Empresa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Panadería Danubio, Farmatodo..."
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rubro / Categoría *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {BASE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Dirección o Referencia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Av. Francisco de Miranda, cerca del metro..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ingreso o Rango Salarial (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: $200 - $250 mensual + bono"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Horario de Trabajo (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Lunes a Viernes 8am - 4pm"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descripción del Empleo *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe las tareas principales, qué perfil de persona buscas..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ¿Cómo deben postularse?
                </label>
                <select
                  value={howToApply}
                  onChange={(e: any) => setHowToApply(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="IN_PERSON">Ir en persona</option>
                  <option value="WHATSAPP">Por WhatsApp</option>
                  <option value="PHONE">Llamada telefónica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  WhatsApp de Contacto
                </label>
                <input
                  type="text"
                  placeholder="Ej: +584141234567"
                  value={contactWhatsapp}
                  onChange={(e) => setContactWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Teléfono de Tienda
                </label>
                <input
                  type="text"
                  placeholder="Ej: +58 212 123 4567"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Instrucciones para quien vaya en persona (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: Acercarse en la mañana y preguntar por el Sr. Roberto con currículo en mano..."
                value={applyInstructions}
                onChange={(e) => setApplyInstructions(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Requisitos (uno por línea)
                </label>
                <textarea
                  rows={2}
                  placeholder="Mayor de edad&#10;Residenciado en la zona&#10;Puntualidad"
                  value={requirementsText}
                  onChange={(e) => setRequirementsText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Beneficios (uno por línea)
                </label>
                <textarea
                  rows={2}
                  placeholder="Transporte nocturno&#10;Almuerzo incluido&#10;Capacitación"
                  value={benefitsText}
                  onChange={(e) => setBenefitsText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
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
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 shadow-lg shadow-emerald-950"
              >
                <Plus className="w-4 h-4" />
                {submitting ? 'Publicando...' : 'Publicar Vacante'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
