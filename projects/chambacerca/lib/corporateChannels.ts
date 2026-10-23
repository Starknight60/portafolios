/**
 * Directorio de Canales de Reclutamiento 100% Reales y Verificados en Venezuela
 * Fuentes consultadas: LinkedIn Oficial, CompuTrabajo Venezuela, Empléate, Instagram y sitios corporativos.
 */

export interface VerifiedChannel {
  companyKeywords: string[];
  officialName: string;
  whatsapp?: string | null;
  email?: string | null;
  computrabajoUrl?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
  portalUrl?: string | null;
  phone?: string | null;
  instructions: string;
  requirements: string[];
  benefits: string[];
  salaryEst: string;
  isNational: boolean;
}

export const VERIFIED_CHANNELS: VerifiedChannel[] = [
  {
    companyKeywords: ['plaza', 'plazas', "plaza's"],
    officialName: "Automercados Plaza's",
    whatsapp: "+584143142541",
    email: "talentohumano@elplazas.com",
    instagramUrl: "https://instagram.com/elplazas",
    portalUrl: "https://www.elplazas.com",
    instructions: "Línea oficial de Talento Humano activa al WhatsApp 0414-3142541 o recepción de currículum con copia de Cédula en taquilla de atención al cliente en cualquier sucursal.",
    requirements: ["Cédula de identidad laminada", "Síntesis curricular con foto", "Certificado de manipulación de alimentos (para áreas de perecederos y alimentos)"],
    benefits: ["Transporte nocturno de colaboradores", "Descuento en compras del automercado", "Bono de asistencia y cesta ticket"],
    salaryEst: "$180 - $220 + Beneficios de ley",
    isNational: true,
  },
  {
    companyKeywords: ['farmatodo'],
    officialName: "Farmatodo C.A.",
    computrabajoUrl: "https://ve.computrabajo.com/empresas/ofertas-de-trabajo-de-farmatodo-ca",
    linkedinUrl: "https://www.linkedin.com/company/farmatodo-c-a-/",
    instagramUrl: "https://instagram.com/gente_farmatodo",
    portalUrl: "https://www.farmatodo.com.ve",
    instructions: "Farmatodo canaliza sus ofertas oficiales por CompuTrabajo Venezuela y su LinkedIn corporativo. Para tiendas físicas, puedes entregar tu CV directamente al Farmacéutico Regente de turno en la farmacia.",
    requirements: ["Bachiller culminado o estudiante universitario", "Cédula y RIF vigente", "Buena presencia y trato respetuoso al paciente"],
    benefits: ["Póliza de seguro HCM", "Descuento del 20% en medicamentos", "Plan de ascenso y capacitación farmacológica"],
    salaryEst: "$200 - $260 + Beneficios Farmatodo",
    isNational: true,
  },
  {
    companyKeywords: ['gama', 'excelsior'],
    officialName: "Gama Supermercados (Excelsior Gama)",
    portalUrl: "https://somosgama.hiringroom.com/",
    email: "reclutamiento@excelsiorgama.com",
    linkedinUrl: "https://www.linkedin.com/company/gama-supermercados/",
    instagramUrl: "https://instagram.com/somosgamave",
    phone: "0800-7378442",
    instructions: "Postulación mediante su plataforma oficial somosgama.hiringroom.com o enviando resumen curricular a reclutamiento@excelsiorgama.com. También atienden en oficina de seguridad en sucursales en horario matutino.",
    requirements: ["Copia de cédula y RIF", "Certificado de manipulación de alimentos vigente para áreas de alimentos", "Disponibilidad para turnos rotativos"],
    benefits: ["Almuerzo/comedor", "Cesta ticket mensual + bono en divisas", "Uniformes y dotación"],
    salaryEst: "$190 - $230 mensual",
    isNational: true,
  },
  {
    companyKeywords: ['traki'],
    officialName: "Tiendas Traki",
    computrabajoUrl: "https://ve.computrabajo.com/empresas/ofertas-de-trabajo-de-centro-traki",
    instagramUrl: "https://instagram.com/trakivenezuela",
    portalUrl: "https://www.traki.com",
    instructions: "Traki recibe postulaciones en persona en el área de atención al cliente de cualquier tienda o Centro Traki a nivel nacional. También publican búsquedas activas en CompuTrabajo Venezuela.",
    requirements: ["Mayor de 18 años", "Resumen curricular impreso", "Copia de Cédula de Identidad", "Disponibilidad para fines de semana"],
    benefits: ["Descuento de empleado en departamentos de moda y hogar", "Pago quincenal puntual", "Comisiones por meta de ventas"],
    salaryEst: "$170 - $220 + Comisiones",
    isNational: true,
  },
  {
    companyKeywords: ['daka'],
    officialName: "Tiendas Daka",
    computrabajoUrl: "https://ve.computrabajo.com/empresas/ofertas-de-trabajo-de-tiendas-daka",
    instagramUrl: "https://instagram.com/tiendasdaka",
    portalUrl: "https://tiendasdaka.com",
    instructions: "Postulación formal a través de CompuTrabajo / Pandapé o en gerencia de tienda de cualquier sucursal en Venezuela (Valencia, Caracas, Barquisimeto, Maracay, Maracaibo, etc.).",
    requirements: ["Experiencia en atención al cliente o ventas", "Buena fluidez verbal", "Cédula y RIF"],
    benefits: ["Comisiones adicionales en divisas por volumen de venta de electrodomésticos", "Ambiente con aire acondicionado"],
    salaryEst: "$200 - $350 (Base + Comisiones)",
    isNational: true,
  },
  {
    companyKeywords: ['epa', 'ferreteria epa'],
    officialName: "Ferretería EPA",
    portalUrl: "https://ferreteriaepa.hiringroom.com/",
    computrabajoUrl: "https://ve.computrabajo.com/empresas/ofertas-de-trabajo-de-ferreteria-epa-ca",
    instagramUrl: "https://instagram.com/ferreteriaepavenezuela",
    instructions: "Postulación directa en su plataforma oficial ferreteriaepa.hiringroom.com o en el perfil oficial de CompuTrabajo. Para puestos operativos, reciben CV en módulo de atención al cliente en tiendas.",
    requirements: ["Bachiller", "Nociones básicas de herramientas, ferretería o construcción", "Orientación al cliente"],
    benefits: ["Póliza HCM", "Dotación completa de calzado y chaleco de seguridad", "Transporte para el personal"],
    salaryEst: "$200 - $250 + Beneficios EPA",
    isNational: true,
  },
  {
    companyKeywords: ['arturo', 'arturos', "arturo's"],
    officialName: "Arturo's Venezuela",
    email: "rrhh@arturos.com.ve",
    portalUrl: "https://www.arturos.com.ve",
    instagramUrl: "https://instagram.com/arturosdeverdad",
    instructions: "Envío directo de síntesis curricular al correo rrhh@arturos.com.ve o entrega en mano al Administrador de cualquier restaurante Arturo's antes de las 11:30 AM.",
    requirements: ["Certificado de salud y manipulación de alimentos vigente", "Mayor de edad", "Disponibilidad para trabajar de pie en área de freidoras y cocina"],
    benefits: ["Comida completa en cada turno de guardia", "Bono de asistencia perfecta", "Capacitación continua"],
    salaryEst: "$180 - $210 + Comida diaria",
    isNational: true,
  },
  {
    companyKeywords: ['kfc'],
    officialName: "KFC Venezuela",
    computrabajoUrl: "https://ve.computrabajo.com/empresas/ofertas-de-trabajo-de-kfc-venezuela",
    instagramUrl: "https://instagram.com/kfcvenezuela",
    instructions: "Postulación mediante CompuTrabajo Venezuela o entrega de currículo directamente en mostrador en horario valle (2:00 PM a 4:30 PM). Horarios adaptables para estudiantes.",
    requirements: ["Cédula laminada", "Certificado de manipulación de alimentos", "Dinamismo y trabajo en equipo"],
    benefits: ["Comida incluida en turno", "Flexibilidad de turnos de medio tiempo para estudios", "Pago quincenal"],
    salaryEst: "$160 - $200 (según turno)",
    isNational: true,
  },
  {
    companyKeywords: ['central madeirense', 'madeirense'],
    officialName: "Supermercados Central Madeirense",
    email: "seleccion@centralmadeirense.com.ve",
    portalUrl: "https://www.centralmadeirense.com.ve",
    instagramUrl: "https://instagram.com/centralmadeirense",
    instructions: "Envío de CV a seleccion@centralmadeirense.com.ve o entrega personal en la oficina administrativa (piso superior) de cualquier sucursal en horario de la mañana.",
    requirements: ["Copia de cédula y RIF", "Disponibilidad para turnos diurnos o mixtos", "Certificado de manipulación (si aplica)"],
    benefits: ["Cesta ticket", "Descuentos corporativos", "Capacitación interna"],
    salaryEst: "$170 - $200",
    isNational: true,
  },
  {
    companyKeywords: ['multimax'],
    officialName: "Multimax Store",
    email: "talento@multimaxstore.com",
    instagramUrl: "https://instagram.com/multimax_store",
    portalUrl: "https://multimaxstore.com",
    instructions: "Envío de síntesis curricular a talento@multimaxstore.com indicando la ciudad de residencia en el asunto (Valencia, Caracas, Maracay, Maracaibo, etc.).",
    requirements: ["Experiencia en ventas de tecnología o electrodomésticos", "Disponibilidad inmediata", "Proactividad"],
    benefits: ["Comisiones por ventas en divisas", "Oportunidad de crecimiento en la cadena retail"],
    salaryEst: "$220 - $350 (Sueldo + Comisiones)",
    isNational: true,
  },
  {
    companyKeywords: ['locatel'],
    officialName: "Locatel Venezuela",
    email: "talento@locatel.com.ve",
    computrabajoUrl: "https://ve.computrabajo.com/empresas/ofertas-de-trabajo-de-locatel",
    instagramUrl: "https://instagram.com/locatelvzla",
    instructions: "Postulación en CompuTrabajo o entrega de CV en el counter de atención médica/farmacia de cada establecimiento.",
    requirements: ["Bachiller o TSU", "Manejo de sistemas de caja y atención al cliente", "Cédula y RIF"],
    benefits: ["Beneficios de salud en consultas y exámenes", "Estabilidad en ambiente climatizado"],
    salaryEst: "$180 - $220",
    isNational: true,
  },
  {
    companyKeywords: ['saas', 'farmacia saas', 'farmacias saas'],
    officialName: "Farmacias SAAS",
    portalUrl: "https://www.farmaciassaas.com",
    computrabajoUrl: "https://ve.computrabajo.com/empresas/ofertas-de-trabajo-de-farmacias-saas",
    instagramUrl: "https://instagram.com/farmaciassaas",
    instructions: "Consignar síntesis curricular en caja o farmacia en cualquier franquicia SAAS de tu ciudad, o postular en CompuTrabajo.",
    requirements: ["Bachiller", "Atención al paciente", "Puntualidad y honestidad"],
    benefits: ["Capacitación en dispensación de medicamentos", "Bonos de puntualidad"],
    salaryEst: "$180 - $230",
    isNational: true,
  },
  {
    companyKeywords: ['banesco'],
    officialName: "Banesco Banco Universal",
    email: "reclutamiento@banesco.com",
    linkedinUrl: "https://www.linkedin.com/company/banesco-banco-universal/",
    instagramUrl: "https://instagram.com/banescobancouniversal",
    instructions: "Postulación formal a través del perfil oficial de LinkedIn o enviando CV a reclutamiento@banesco.com indicando cargo de interés (Cajero, Atención al Cliente, Asesor).",
    requirements: ["Estudiante universitario o graduado (Administración, Contaduría, Economía, afines)", "Habilidad analítica"],
    benefits: ["Póliza HCM de primer nivel", "Bonificación en divisas", "Plan de carrera bancario"],
    salaryEst: "$250 - $400",
    isNational: true,
  },
  {
    companyKeywords: ['mercantil'],
    officialName: "Banco Mercantil",
    email: "empleos@bancomercantil.com",
    linkedinUrl: "https://www.linkedin.com/company/mercantil-banco/",
    instagramUrl: "https://instagram.com/mercantilbanco",
    instructions: "Envío de CV a empleos@bancomercantil.com o mediante su página oficial de empleos en LinkedIn.",
    requirements: ["TSU o Licenciatura en áreas comerciales o administrativas", "Excelente presencia"],
    benefits: ["Seguro médico privado", "Préstamos al colaborador", "Bono de alimentación superior"],
    salaryEst: "$250 - $400",
    isNational: true,
  },
];

/**
 * Busca si un nombre de lugar coincide con alguna cadena corporativa con canales oficiales verificados
 */
export function findVerifiedChannel(placeName: string): VerifiedChannel | null {
  const lower = placeName.toLowerCase();
  for (const channel of VERIFIED_CHANNELS) {
    if (channel.companyKeywords.some((kw) => lower.includes(kw))) {
      return channel;
    }
  }
  return null;
}
