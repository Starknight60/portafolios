const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  console.log('🌱 Sembrando datos iniciales en Neon PostgreSQL (chambacerca)...');

  try {
    const passwordHash = await bcrypt.hash('Chamba2026!', 10);

    // 1. Empleadores
    const employer1Id = 'usr_emp_plazas_01';
    const employer2Id = 'usr_emp_danubio_02';

    await sql.query(`
      INSERT INTO chambacerca."User" ("id", "email", "password", "name", "company", "phone", "isVerified", "role")
      VALUES 
        ($1, 'rrhh@plazas.com', $2, 'Coordinación RRHH Plaza', 'Automercados Plazas', '+584141234567', true, 'EMPLOYER'),
        ($3, 'talento@danubio.com', $2, 'Gerencia Pastelería Danubio', 'Pastelería Danubio Chacao', '+584249876543', true, 'EMPLOYER')
      ON CONFLICT ("email") DO NOTHING;
    `, [employer1Id, passwordHash, employer2Id]);
    console.log('✅ Empleadores de demostración sembrados.');

    // 2. Vacantes de proximidad verificadas
    const vacancies = [
      {
        id: 'vac_01',
        title: 'Cajero / Atención al Cliente (Turno Rotativo)',
        description: 'Buscamos personal dinámico para caja y atención al cliente. No requerimos experiencia previa, brindamos capacitación paga desde el primer día.',
        placeName: 'Automercados Plaza Los Palos Grandes',
        category: 'supermarket',
        address: 'Av. Andrés Bello c/c 1ra Transversal, Los Palos Grandes',
        city: 'Caracas',
        latitude: 10.4952,
        longitude: -66.8485,
        jobType: 'FULL_TIME',
        schedule: 'Lunes a Sábado, turnos de 7:00 AM a 3:00 PM o 1:00 PM a 9:00 PM',
        salaryRange: '$180 - $220 + Bono de alimentación',
        howToApply: 'IN_PERSON',
        contactPhone: '+58 212 285 4122',
        contactWhatsapp: '+584141234567',
        contactEmail: 'rrhh@plazas.com',
        applyInstructions: 'Acércate a la taquilla de atención al cliente con copia de cédula y resumen curricular entre 9:00 AM y 12:00 PM.',
        requirements: ['Mayor de 18 años', 'Residenciado cerca del municipio Chacao o Sucre', 'Buena presencia y trato respetuoso'],
        benefits: ['Transporte de salida nocturno', 'Descuento en compras del automercado', 'Bono de puntualidad'],
        employerId: employer1Id,
        daysValid: 30
      },
      {
        id: 'vac_02',
        title: 'Ayudante de Panadería & Maestro Pastelero',
        description: 'Se solicita ayudante con nociones básicas de masas, fermentación y horneado para apoyar en la producción matutina de pan salado y dulce.',
        placeName: 'Pastelería Danubio Chacao',
        category: 'bakery',
        address: 'Calle Guaicaipuro c/c Av. Francisco de Miranda, Chacao',
        city: 'Caracas',
        latitude: 10.4915,
        longitude: -66.8560,
        jobType: 'FULL_TIME',
        schedule: 'Martes a Domingo, 6:00 AM a 2:00 PM',
        salaryRange: '$220 - $280 mensual',
        howToApply: 'WHATSAPP',
        contactWhatsapp: '+584249876543',
        contactPhone: '+58 212 263 7812',
        applyInstructions: 'Escribe al WhatsApp indicando cuántos años de experiencia tienes y fotos de tus trabajos anteriores.',
        requirements: ['Experiencia previa demostrable en panadería o repostería', 'Certificado de manipulación de alimentos vigente', 'Puntualidad estricta'],
        benefits: ['Almuerzo incluido', 'Bonificación semanal por metas de producción', 'Propina compartida'],
        employerId: employer2Id,
        daysValid: 25
      },
      {
        id: 'vac_03',
        title: 'Auxiliar de Farmacia & Despacho',
        description: 'Atención a pacientes, dispensación de fórmulas médicas, reposición de estanterías y control de inventario.',
        placeName: 'Farmatodo La Castellana',
        category: 'pharmacy',
        address: 'Av. Principal de La Castellana c/c 2da Transversal',
        city: 'Caracas',
        latitude: 10.4990,
        longitude: -66.8520,
        jobType: 'FULL_TIME',
        schedule: 'Turno mixto, 5 días a la semana con 2 libres',
        salaryRange: '$200 - $240 + Beneficios de ley',
        howToApply: 'IN_PERSON',
        contactPhone: '+58 212 261 9090',
        contactWhatsapp: '+584128899112',
        applyInstructions: 'Preguntar directamente por el Gerente de Tienda de 8:00 AM a 11:00 AM.',
        requirements: ['Bachiller culminado', 'Manejo de paquete Office básico', 'Empatía y vocación de servicio al paciente'],
        benefits: ['Póliza HCM', 'Capacitación en farmacología para ascenso a farmacéutico'],
        employerId: null,
        daysValid: 20
      },
      {
        id: 'vac_04',
        title: 'Mesero / Barista y Atención en Salón',
        description: 'Servicio en mesas, preparación de cafés de especialidad y bebidas frías, cuadre de comanda y atención cordial a clientes.',
        placeName: 'Café & Restaurant El Alazán',
        category: 'restaurant',
        address: 'Av. Luis Roche con 4ta Transversal, Altamira',
        city: 'Caracas',
        latitude: 10.4968,
        longitude: -66.8510,
        jobType: 'FULL_TIME',
        schedule: 'Miércoles a Domingo de 12:00 PM a 9:00 PM',
        salaryRange: '$190 + Propinas diarias en divisas (aprox. $150-250 adicionales)',
        howToApply: 'IN_PERSON',
        contactPhone: '+58 212 262 1475',
        contactWhatsapp: '+584145551234',
        applyInstructions: 'Presentar CV impreso en barra a las 3:30 PM (hora valle de clientes). Preguntar por el Capitán de Mesoneros.',
        requirements: ['Buena dicción y presencia impecable', 'Experiencia mínima de 6 meses en atención en salón'],
        benefits: ['Comida del personal incluida', 'Propinas 100% directas al equipo de sala'],
        employerId: null,
        daysValid: 15
      },
      {
        id: 'vac_05',
        title: 'Mecánico de Mantenimiento Preventivo & Frenos',
        description: 'Cambio de aceite y filtros, diagnóstico y cambio de pastillas/discos de frenos, alineación y balanceo computarizado.',
        placeName: 'Taller Rápido Servicars Los Ruices',
        category: 'mechanic',
        address: 'Av. Francisco de Miranda, cruce con Av. Diego Cisneros, Los Ruices',
        city: 'Caracas',
        latitude: 10.4880,
        longitude: -66.8320,
        jobType: 'FULL_TIME',
        schedule: 'Lunes a Viernes de 8:00 AM a 5:00 PM',
        salaryRange: '$250 - $350 según destreza mecánica',
        howToApply: 'WHATSAPP',
        contactWhatsapp: '+584167778899',
        contactPhone: '+58 212 239 8811',
        applyInstructions: 'Enviar por WhatsApp detalle de los talleres donde has trabajado y qué marcas de vehículos dominas.',
        requirements: ['Experiencia práctica en mecánica automotriz ligera', 'Herramientas básicas propias (deseable)'],
        benefits: ['Uniforme completo', 'Comisión adicional por trabajo realizado', 'Sábados y domingos libres'],
        employerId: null,
        daysValid: 28
      },
      {
        id: 'vac_06',
        title: 'Operario de Almacén y Control de Despachos',
        description: 'Recepción de gandolas, etiquetado de cajas, preparación de pedidos (picking) y estiba de paletas.',
        placeName: 'Centro de Distribución Logística La Trinidad',
        category: 'warehouse',
        address: 'Zona Industrial La Trinidad, Calle San Antonio',
        city: 'Caracas',
        latitude: 10.4350,
        longitude: -66.8610,
        jobType: 'FULL_TIME',
        schedule: 'Lunes a Viernes de 7:30 AM a 4:30 PM',
        salaryRange: '$200 - $240 + Bono de asistencia perfecta',
        howToApply: 'IN_PERSON',
        contactPhone: '+58 212 943 0012',
        contactWhatsapp: '+584241112233',
        applyInstructions: 'Llegar a la caseta de vigilancia con síntesis curricular y copia de RIF.',
        requirements: ['Condición física adecuada para carga de bultos hasta 20kg', 'Responsabilidad y puntualidad'],
        benefits: ['Servicio médico interno', 'Transporte desde la estación de metro más cercana'],
        employerId: null,
        daysValid: 30
      },
      {
        id: 'vac_07',
        title: 'Asesor de Ventas & Arreglo Visual de Tienda',
        description: 'Atención a compradores, reposición de tallas, doblado y exhibición de prendas, control de probadores.',
        placeName: 'Tienda Moda & Hogar Sabana Grande',
        category: 'store',
        address: 'Bulevar de Sabana Grande, Edificio Galerías Bolívar',
        city: 'Caracas',
        latitude: 10.4900,
        longitude: -66.8790,
        jobType: 'FULL_TIME',
        schedule: 'Lunes a Domingo con 2 días libres continuos (10:00 AM a 7:00 PM)',
        salaryRange: '$170 + Comisión por ventas de departamento',
        howToApply: 'IN_PERSON',
        contactPhone: '+58 212 762 3344',
        contactWhatsapp: '+584149990011',
        applyInstructions: 'Entregar currículo en caja principal en horario de 11:00 AM a 1:00 PM.',
        requirements: ['Ganas de aprender y buena actitud con los clientes', 'Bachillerato aprobado'],
        benefits: ['Descuento de empleado en todas las sucursales', 'Excelente ambiente laboral'],
        employerId: null,
        daysValid: 22
      },
      {
        id: 'vac_08',
        title: 'Camillero & Asistente de Traslado de Pacientes',
        description: 'Traslado seguro de pacientes hospitalizados a salas de imagenología, quirófano y laboratorio clínico.',
        placeName: 'Clínica San Bernardino',
        category: 'clinic',
        address: 'Av. Los Próceres, San Bernardino',
        city: 'Caracas',
        latitude: 10.5100,
        longitude: -66.8970,
        jobType: 'FULL_TIME',
        schedule: 'Guardias 24x48 o turno diurno rotativo',
        salaryRange: '$220 - $260',
        howToApply: 'IN_PERSON',
        contactPhone: '+58 212 555 8890',
        contactWhatsapp: '+584126665544',
        applyInstructions: 'Dirigirse a Recursos Humanos (Piso 1) los días Martes y Jueves de 8:30 AM a 11:30 AM.',
        requirements: ['Certificado de salud vigente', 'Sensibilidad y trato humanitario con pacientes'],
        benefits: ['Comedor subvencionado', 'Beneficios de salud para familiares directos'],
        employerId: null,
        daysValid: 30
      }
    ];

    for (const v of vacancies) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + v.daysValid);

      await sql.query(`
        INSERT INTO chambacerca."Vacancy" (
          "id", "title", "description", "placeName", "category", "address", "city",
          "latitude", "longitude", "jobType", "schedule", "salaryRange", "howToApply",
          "contactPhone", "contactWhatsapp", "contactEmail", "applyInstructions",
          "requirements", "benefits", "employerId", "expiresAt", "status", "isVerified"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21, 'ACTIVE', true
        )
        ON CONFLICT ("id") DO UPDATE SET
          "title" = EXCLUDED."title",
          "description" = EXCLUDED."description",
          "salaryRange" = EXCLUDED."salaryRange",
          "schedule" = EXCLUDED."schedule",
          "updatedAt" = CURRENT_TIMESTAMP;
      `, [
        v.id, v.title, v.description, v.placeName, v.category, v.address, v.city,
        v.latitude, v.longitude, v.jobType, v.schedule, v.salaryRange, v.howToApply,
        v.contactPhone || null, v.contactWhatsapp || null, v.contactEmail || null, v.applyInstructions || null,
        v.requirements, v.benefits, v.employerId, expiresAt
      ]);
    }
    console.log(`✅ ${vacancies.length} vacantes de proximidad sembradas correctamente.`);

    // 3. Reportes comunitarios ("Fui a preguntar")
    const reports = [
      {
        id: 'rep_01',
        placeOsmId: 'osm_node_1001',
        placeName: 'Panadería La Mansión del Pan',
        category: 'bakery',
        latitude: 10.4930,
        longitude: -66.8530,
        status: 'HIRING',
        roleHiring: 'Ayudante de Mostrador',
        comment: 'Tienen un cartel en la puerta pegado hoy diciendo "Se solicita muchacho para atender mostrador"',
        contactTip: 'Preguntar en caja por Don Manuel en las mañanas',
        deviceHash: 'dev_hash_seed_1',
        upvotes: 8
      },
      {
        id: 'rep_02',
        placeOsmId: 'osm_node_1002',
        placeName: 'Ferretería El Tornillo Dorado',
        category: 'store',
        latitude: 10.4910,
        longitude: -66.8500,
        status: 'HIRING',
        roleHiring: 'Despachador de Mostrador',
        comment: 'Fui a comprar un cable y me dijeron que les hace falta un despachador que sepa de herramientas.',
        contactTip: 'Llevar CV en físico después del mediodía',
        deviceHash: 'dev_hash_seed_2',
        upvotes: 5
      },
      {
        id: 'rep_03',
        placeOsmId: 'osm_node_1003',
        placeName: 'Farmacia Saas Centro',
        category: 'pharmacy',
        latitude: 10.4975,
        longitude: -66.8540,
        status: 'NOT_HIRING',
        roleHiring: null,
        comment: 'Fui ayer a preguntar y dijeron que tienen el personal completo por este trimestre.',
        contactTip: 'No están recibiendo currículos en este momento',
        deviceHash: 'dev_hash_seed_3',
        upvotes: 4
      }
    ];

    for (const r of reports) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await sql.query(`
        INSERT INTO chambacerca."PlaceReport" (
          "id", "placeOsmId", "placeName", "category", "latitude", "longitude",
          "status", "roleHiring", "comment", "contactTip", "deviceHash", "upvotes", "expiresAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        )
        ON CONFLICT ("id") DO NOTHING;
      `, [
        r.id, r.placeOsmId, r.placeName, r.category, r.latitude, r.longitude,
        r.status, r.roleHiring, r.comment, r.contactTip, r.deviceHash, r.upvotes, expiresAt
      ]);
    }
    console.log(`✅ ${reports.length} reportes comunitarios sembrados.`);

    console.log('🎉 Seed completado exitosamente.');
  } catch (err) {
    console.error('❌ Error en seed:', err);
    process.exit(1);
  }
}

seed();
