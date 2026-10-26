'use client';

import { useState, useEffect } from 'react';
import { 
  X, FileText, Printer, Copy, Check, Sparkles, User, Briefcase, 
  GraduationCap, Award, Phone, Mail, MapPin, CheckCircle2, 
  Share2, ArrowRight, Eye, Edit3, Download, RefreshCw
} from 'lucide-react';
import { PlaceResultItem } from '@/app/api/places/route';

interface CurriculumBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlace?: PlaceResultItem | null;
}

export default function CurriculumBuilderModal({
  isOpen,
  onClose,
  selectedPlace,
}: CurriculumBuilderModalProps) {
  // Estados del Formulario
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('Caracas, Venezuela');
  const [targetRole, setTargetRole] = useState('');
  const [availability, setAvailability] = useState('Disponibilidad Inmediata • Turnos Rotativos');
  const [aboutMe, setAboutMe] = useState(
    'Persona responsable, honesta y puntual con vocación de servicio, proactiva y con disposición para trabajar en equipo y bajo presión.'
  );

  // Educación & Papeles
  const [educationLevel, setEducationLevel] = useState('Bachiller en Ciencias / Educación Media');
  const [hasFoodCert, setHasFoodCert] = useState(true);
  const [hasHealthCert, setHasHealthCert] = useState(true);
  const [hasRif, setHasRif] = useState(true);
  const [extraCourses, setExtraCourses] = useState('Atención al Cliente • Manejo de Punto de Venta');

  // Experiencia Laboral
  const [isFirstJob, setIsFirstJob] = useState(false);
  const [exp1Company, setExp1Company] = useState('Comercio / Abasto Local');
  const [exp1Role, setExp1Role] = useState('Atención al Público y Cobro');
  const [exp1Period, setExp1Period] = useState('2023 - 2024');
  const [exp1Tasks, setExp1Tasks] = useState('Manejo de caja, reposición de mercancía en anaqueles y atención directa a clientes.');

  const [exp2Company, setExp2Company] = useState('');
  const [exp2Role, setExp2Role] = useState('');
  const [exp2Period, setExp2Period] = useState('');

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [copiedText, setCopiedText] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Cargar datos guardados del usuario en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('chambacerca_cv_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.fullName) setFullName(parsed.fullName);
          if (parsed.idNumber) setIdNumber(parsed.idNumber);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.location) setLocation(parsed.location);
          if (parsed.targetRole) setTargetRole(parsed.targetRole);
          if (parsed.aboutMe) setAboutMe(parsed.aboutMe);
          if (parsed.educationLevel) setEducationLevel(parsed.educationLevel);
          if (parsed.extraCourses) setExtraCourses(parsed.extraCourses);
          if (parsed.exp1Company) setExp1Company(parsed.exp1Company);
          if (parsed.exp1Role) setExp1Role(parsed.exp1Role);
          if (parsed.exp1Tasks) setExp1Tasks(parsed.exp1Tasks);
        }
      } catch {}
    }
  }, []);

  // Pre-llenar cargo si se abrió desde una vacante seleccionada
  useEffect(() => {
    if (selectedPlace?.title) {
      setTargetRole(selectedPlace.title);
    }
  }, [selectedPlace]);

  if (!isOpen) return null;

  // Guardar en almacenamiento local del dispositivo
  const handleSaveToDevice = () => {
    try {
      const data = {
        fullName,
        idNumber,
        phone,
        email,
        location,
        targetRole,
        aboutMe,
        educationLevel,
        extraCourses,
        exp1Company,
        exp1Role,
        exp1Tasks,
      };
      localStorage.setItem('chambacerca_cv_data', JSON.stringify(data));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch {}
  };

  // Plantillas Rápidas de Perfil
  const applyPresetProfile = (type: 'ventas' | 'almacen' | 'primer_empleo') => {
    if (type === 'ventas') {
      setTargetRole('Cajero / Atención al Cliente / Ventas');
      setAboutMe('Persona dinámica y comunicativa con experiencia en trato cordial con clientes, manejo de puntos de venta y cuadre de caja diario. Orientada al cumplimiento de metas comerciales.');
    } else if (type === 'almacen') {
      setTargetRole('Almacén / Pasillero / Reposición / Inventario');
      setAboutMe('Trabajador proactivo y ordenado con capacidad para carga y descarga de mercancía, control de inventarios, reposición en anaqueles y organización de depósitos.');
    } else {
      setIsFirstJob(true);
      setTargetRole('Auxiliar General / Primer Empleo');
      setAboutMe('Joven proactivo con alto sentido de compromiso y puntualidad, buscando mi primera oportunidad laboral formal. Con excelente actitud, capacidad rápida de aprendizaje y ganas de trabajar.');
    }
  };

  // Copiar Síntesis Curricular en texto para WhatsApp
  const handleCopyForWhatsApp = () => {
    const text = `📄 *SÍNTESIS CURRICULAR - ${fullName.toUpperCase() || 'CANDIDATO'}*
*Cédula:* ${idNumber || 'En trámite'} | *Teléfono:* ${phone || 'No especificado'}
*Ubicación:* ${location}
*Cargo Solicitado:* ${targetRole || 'Vacante General'}
*Disponibilidad:* ${availability}

*Perfil:*
${aboutMe}

*Instrucción:* ${educationLevel}
${hasFoodCert ? '✓ Certificado de Manipulación de Alimentos al día' : ''}
${hasHealthCert ? '✓ Certificado de Salud Vigente' : ''}
${hasRif ? '✓ Copia de RIF del SENIAT actualizado' : ''}
${extraCourses ? `*Cursos y Destrezas:* ${extraCourses}` : ''}

*Experiencia:*
${isFirstJob 
  ? '• En búsqueda de primer empleo formal (Disponibilidad inmediata para inducción y entrenamiento)'
  : `• ${exp1Role} en ${exp1Company} (${exp1Period})\n  Funciones: ${exp1Tasks}`}
${exp2Company ? `\n• ${exp2Role} en ${exp2Company} (${exp2Period})` : ''}

_Documentos físicos y síntesis curricular disponibles para consignación inmediata._`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Función de Impresión / Descarga PDF Nativa
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[94vh] bg-[#0A101C] border border-cyan-500/40 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Generador de CV */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-gradient-to-r from-cyan-950/60 via-[#0B1527] to-[#0A101C] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <FileText className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Generador de Síntesis Curricular (1 Página)</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-cyan-500 text-slate-950 rounded-full font-mono">
                  FORMATO VZLA
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Crea tu currículum adaptado al estándar de empresas venezolanas en 2 minutos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Selector Móvil de Vista (Editor vs Preview) */}
            <div className="flex md:hidden bg-slate-900 p-0.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  activeTab === 'editor' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                Datos
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  activeTab === 'preview' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                Hoja CV
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition border border-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido Principal: Grid Dividido (Formulario a la izquierda, Hoja A4 en vivo a la derecha) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-4 p-4 sm:p-5">
          
          {/* =========================================================================
              COLUMNA IZQUIERDA: FORMULARIO ASISTIDO (7 COLS EN MD)
              ========================================================================= */}
          <div className={`md:col-span-6 space-y-4 ${activeTab === 'editor' ? 'block' : 'hidden md:block'}`}>
            
            {/* Botones de Autocompletado Rápido */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Plantillas Rápidas de 1 Clic para Venezuela:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => applyPresetProfile('ventas')}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 transition cursor-pointer"
                >
                  🛒 Cajero / Atención
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetProfile('almacen')}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 transition cursor-pointer"
                >
                  📦 Almacén / Pasillero
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetProfile('primer_empleo')}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-800/60 transition cursor-pointer"
                >
                  🌱 Primer Empleo
                </button>
              </div>
            </div>

            {/* SECCIÓN 1: DATOS PERSONALES */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>1. Datos Personales</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej: Carlos Eduardo Pérez"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Cédula de Identidad *</label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="Ej: V-28.123.456"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej: 0412-1234567"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Ubicación / Residencia *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ej: Chacao, Caracas"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: CARGO Y DISPONIBILIDAD */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>2. Puesto Deseado & Perfil</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Cargo a Postular</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="Ej: Cajero / Atención al Cliente"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Disponibilidad de Turno</label>
                  <input
                    type="text"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    placeholder="Ej: Inmediata • Turno Mañana / Tarde"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Perfil Profesional Resumido</label>
                <textarea
                  rows={2}
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* SECCIÓN 3: DOCUMENTOS Y ESTUDIOS */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>3. Estudios & Recaudos Venezolanos</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Nivel Educativo</label>
                  <input
                    type="text"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    placeholder="Ej: Bachiller en Ciencias"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Cursos o Destrezas Clave</label>
                  <input
                    type="text"
                    value={extraCourses}
                    onChange={(e) => setExtraCourses(e.target.value)}
                    placeholder="Ej: Punto de Venta, Excel, Inglés"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasFoodCert}
                    onChange={(e) => setHasFoodCert(e.target.checked)}
                    className="rounded text-emerald-500"
                  />
                  <span className="text-[11px] text-slate-300">Manipulación</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasHealthCert}
                    onChange={(e) => setHasHealthCert(e.target.checked)}
                    className="rounded text-emerald-500"
                  />
                  <span className="text-[11px] text-slate-300">Cert. Salud</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasRif}
                    onChange={(e) => setHasRif(e.target.checked)}
                    className="rounded text-emerald-500"
                  />
                  <span className="text-[11px] text-slate-300">RIF SENIAT</span>
                </label>
              </div>
            </div>

            {/* SECCIÓN 4: EXPERIENCIA PREVIA */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>4. Experiencia Previa</span>
                </h3>
                <label className="flex items-center gap-1.5 text-[11px] text-cyan-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFirstJob}
                    onChange={(e) => setIsFirstJob(e.target.checked)}
                    className="rounded text-cyan-500"
                  />
                  <span>Primer Empleo Formal</span>
                </label>
              </div>

              {!isFirstJob && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={exp1Company}
                      onChange={(e) => setExp1Company(e.target.value)}
                      placeholder="Empresa o Comercio"
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                    <input
                      type="text"
                      value={exp1Role}
                      onChange={(e) => setExp1Role(e.target.value)}
                      placeholder="Cargo desempeñado"
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <input
                    type="text"
                    value={exp1Tasks}
                    onChange={(e) => setExp1Tasks(e.target.value)}
                    placeholder="Principales funciones realizadas"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              )}
            </div>

          </div>

          {/* =========================================================================
              COLUMNA DERECHA: VISTA PREVIA HOJA A4 / CARTA EN TIEMPO REAL
              ========================================================================= */}
          <div className={`md:col-span-6 flex flex-col items-center justify-start ${activeTab === 'preview' ? 'block' : 'hidden md:block'}`}>
            
            {/* HOJA IMPRIMIBLE DE SÍNTESIS CURRICULAR (ESTÁNDAR FORMAL 1 PÁGINA) */}
            <div 
              id="printable-cv-sheet"
              className="w-full bg-white text-slate-900 rounded-xl p-6 sm:p-7 shadow-2xl border border-slate-200 text-left font-sans select-text space-y-4 text-xs leading-normal"
            >
              {/* Encabezado */}
              <div className="border-b-2 border-slate-900 pb-3 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950">
                    {fullName || 'NOMBRE DEL CANDIDATO'}
                  </h1>
                  <p className="text-xs font-bold text-slate-700 tracking-wide mt-0.5 uppercase">
                    {targetRole || 'SOLICITANTE DE EMPLEO'}
                  </p>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5 text-right">
                  <p><strong>C.I:</strong> {idNumber || 'V-XXXXXXXX'}</p>
                  <p><strong>Telf:</strong> {phone || '0412-XXXXXXX'}</p>
                  <p>{location}</p>
                </div>
              </div>

              {/* Perfil */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                  Perfil Laboral & Disponibilidad
                </h4>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  {aboutMe}
                </p>
                <p className="text-[10px] text-slate-600 mt-1 font-semibold">
                  • {availability}
                </p>
              </div>

              {/* Experiencia Laboral */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                  Experiencia Laboral
                </h4>
                {isFirstJob ? (
                  <p className="text-[11px] text-slate-600 italic">
                    En búsqueda de primera oportunidad laboral formal. Disponibilidad para entrenamiento inmediato, aprendizaje rápido y compromiso de permanencia.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                        <span>{exp1Role || 'Cargo Desempeñado'} — {exp1Company || 'Empresa / Comercio'}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{exp1Period || 'Reciente'}</span>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        {exp1Tasks || 'Atención al cliente, inventario y soporte general en sala de ventas.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Educación & Recaudos */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                  Educación & Documentación Vigente
                </h4>
                <p className="text-[11px] text-slate-800 font-medium">
                  • {educationLevel}
                </p>
                {extraCourses && (
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    • <strong>Cursos y Destrezas:</strong> {extraCourses}
                  </p>
                )}

                <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-2 gap-1 text-[10px] text-slate-700">
                  {hasFoodCert && <span>✓ Certificado Manipulación de Alimentos</span>}
                  {hasHealthCert && <span>✓ Certificado de Salud Vigente</span>}
                  {hasRif && <span>✓ RIF SENIAT Actualizado</span>}
                  <span>✓ Cédula Laminada Vigente</span>
                </div>
              </div>

              {/* Pie de Página */}
              <div className="pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400">
                Síntesis curricular generada para consignación laboral • Documentos físicos listos para entrevista.
              </div>
            </div>

            {/* Controles de Acción para el CV */}
            <div className="w-full flex items-center justify-between gap-2 mt-3 flex-wrap">
              <button
                type="button"
                onClick={handleSaveToDevice}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition flex items-center gap-1.5 cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>¡Guardado!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Guardar Datos</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyForWhatsApp}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  copiedText
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_12px_#10B981]'
                    : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60'
                }`}
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Copiado para WhatsApp!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar para WhatsApp</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-cyan-950 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Descargar PDF / Imprimir</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
