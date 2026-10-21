const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando datos empresariales en PostgreSQL (adradar_db)...');

  // Limpiar datos existentes
  await prisma.boardItem.deleteMany();
  await prisma.board.deleteMany();
  await prisma.competitorPair.deleteMany();
  await prisma.ad.deleteMany();
  await prisma.company.deleteMany();

  // 1. EMPRESAS
  const arturos = await prisma.company.create({
    data: {
      name: "Arturo's",
      slug: 'arturos',
      industry: 'food',
      tagline: 'El pollo frito más crujiente y tradicional',
      logoColor: '#DC2626',
      logoIcon: 'Utensils',
      website: 'https://arturos.com',
      country: 'Venezuela / LATAM',
      activeAdsCount: 4,
    },
  });

  const kfc = await prisma.company.create({
    data: {
      name: 'KFC',
      slug: 'kfc',
      industry: 'food',
      tagline: 'Para chuparse los dedos',
      logoColor: '#B91C1C',
      logoIcon: 'Flame',
      website: 'https://kfc.com',
      country: 'Global / LATAM',
      activeAdsCount: 5,
    },
  });

  const mcdonalds = await prisma.company.create({
    data: {
      name: "McDonald's",
      slug: 'mcdonalds',
      industry: 'food',
      tagline: 'Me encanta todo esto',
      logoColor: '#F59E0B',
      logoIcon: 'Sparkles',
      website: 'https://mcdonalds.com',
      country: 'Global / LATAM',
      activeAdsCount: 4,
    },
  });

  const pedidosYa = await prisma.company.create({
    data: {
      name: 'PedidosYa',
      slug: 'pedidosya',
      industry: 'delivery',
      tagline: 'Tu mundo al instante',
      logoColor: '#EF4444',
      logoIcon: 'Bike',
      website: 'https://pedidosya.com',
      country: 'LATAM',
      activeAdsCount: 4,
    },
  });

  const yummy = await prisma.company.create({
    data: {
      name: 'Yummy',
      slug: 'yummy',
      industry: 'delivery',
      tagline: 'Delivery y Rides en una sola app',
      logoColor: '#8B5CF6',
      logoIcon: 'ShoppingBag',
      website: 'https://yummy.la',
      country: 'LATAM',
      activeAdsCount: 3,
    },
  });

  const ridery = await prisma.company.create({
    data: {
      name: 'Ridery',
      slug: 'ridery',
      industry: 'mobility',
      tagline: 'Muévete seguro y a tiempo',
      logoColor: '#10B981',
      logoIcon: 'Car',
      website: 'https://ridery.app',
      country: 'LATAM',
      activeAdsCount: 3,
    },
  });

  const farmatodo = await prisma.company.create({
    data: {
      name: 'Farmatodo',
      slug: 'farmatodo',
      industry: 'pharmacy',
      tagline: 'Cuentas con nosotros 24 horas',
      logoColor: '#2563EB',
      logoIcon: 'Cross',
      website: 'https://farmatodo.com',
      country: 'LATAM',
      activeAdsCount: 4,
    },
  });

  const locatel = await prisma.company.create({
    data: {
      name: 'Locatel',
      slug: 'locatel',
      industry: 'pharmacy',
      tagline: 'Salud, bienestar y equipamiento médico',
      logoColor: '#059669',
      logoIcon: 'HeartPulse',
      website: 'https://locatel.com',
      country: 'LATAM',
      activeAdsCount: 3,
    },
  });

  const apple = await prisma.company.create({
    data: {
      name: 'Apple',
      slug: 'apple',
      industry: 'tech',
      tagline: 'Think Different • Titanio de grado aeroespacial',
      logoColor: '#64748B',
      logoIcon: 'Smartphone',
      website: 'https://apple.com',
      country: 'Global',
      activeAdsCount: 3,
    },
  });

  const samsung = await prisma.company.create({
    data: {
      name: 'Samsung',
      slug: 'samsung',
      industry: 'tech',
      tagline: 'Galaxy AI is Here',
      logoColor: '#3B82F6',
      logoIcon: 'Cpu',
      website: 'https://samsung.com',
      country: 'Global',
      activeAdsCount: 4,
    },
  });

  const playstation = await prisma.company.create({
    data: {
      name: 'PlayStation',
      slug: 'playstation',
      industry: 'gaming',
      tagline: 'Play Has No Limits',
      logoColor: '#1D4ED8',
      logoIcon: 'Gamepad2',
      website: 'https://playstation.com',
      country: 'Global',
      activeAdsCount: 3,
    },
  });

  const xbox = await prisma.company.create({
    data: {
      name: 'Xbox',
      slug: 'xbox',
      industry: 'gaming',
      tagline: 'Power Your Dreams • Game Pass',
      logoColor: '#16A34A',
      logoIcon: 'Gamepad',
      website: 'https://xbox.com',
      country: 'Global',
      activeAdsCount: 3,
    },
  });

  // 2. PARES COMPETITIVOS HEAD-TO-HEAD
  await prisma.competitorPair.createMany({
    data: [
      {
        companyAId: arturos.id,
        companyBId: kfc.id,
        industry: 'food',
        insightNote:
          'Batalla directa por el pollo frito. Arturo\'s se enfoca en combos tradicionales con ensalada y pan dulce, mientras que KFC ataca con precios agresivos en baldes familiares y salsas especiales.',
      },
      {
        companyAId: pedidosYa.id,
        companyBId: yummy.id,
        industry: 'delivery',
        insightNote:
          'Guerra de cupones y suscripciones. PedidosYa empuja envíos gratis y conveniencia masiva; Yummy contrarresta con integración de transporte en taxi (Yummy Rides) y descuentos combinados.',
      },
      {
        companyAId: farmatodo.id,
        companyBId: locatel.id,
        industry: 'pharmacy',
        insightNote:
          'Farmatodo domina en dermocosmética y snacks de impulso con delivery express nocturno; Locatel compite con equipamiento médico mayor, alquiler y descuentos en medicinas especializadas.',
      },
      {
        companyAId: apple.id,
        companyBId: samsung.id,
        industry: 'tech',
        insightNote:
          'Duelo por la gama premium. Samsung promociona funciones de Inteligencia Artificial (Galaxy AI) y zoom 100x; Apple destaca privacidad, calidad de video cinematográfico y ecosistema.',
      },
      {
        companyAId: playstation.id,
        companyBId: xbox.id,
        industry: 'gaming',
        insightNote:
          'Estrategia de catálogo. PlayStation promueve títulos exclusivos de alta producción; Xbox promociona su servicio de suscripción mensual Xbox Game Pass.',
      },
    ],
  });

  // 3. ANUNCIOS PUBLICITARIOS REALES Y CREATIVOS
  await prisma.ad.createMany({
    data: [
      // ARTURO'S
      {
        companyId: arturos.id,
        headline: '🍗 ¡El Balde Legendario volvió con TODO por solo $9.99!',
        bodyText:
          '¿Antojo de verdadero pollo crujiente? Pide nuestro Balde Familiar de 8 piezas recién salidas, 2 raciones de papas fritas doradas, 2 panes suaves y 2 bebidas refrescantes. ¡Solo por tiempo limitado en todas nuestras sucursales y pickup!',
        callToAction: 'ORDER_NOW',
        platform: 'INSTAGRAM',
        format: 'VERTICAL_REEL',
        offerType: 'COMBO',
        offerBadge: 'COMBO $9.99',
        accentGradient: 'from-amber-500 via-orange-600 to-red-600',
        estimatedReach: 145000,
        daysActive: 14,
        isActive: true,
        targetAudience: 'Amantes de la comida rápida • 18-45 años • Zonas urbanas',
      },
      {
        companyId: arturos.id,
        headline: '🥪 2x1 en Hamburguesas Crispy Chicken todos los Jueves',
        bodyText:
          'Los jueves saben mejor en compañía. Compra una hamburguesa Crispy Deluxe con filete de pechuga 100% real, lechuga fresca y mayonesa de la casa, y la segunda va por nuestra cuenta. Muestra este anuncio en caja.',
        callToAction: 'GET_OFFER',
        platform: 'TIKTOK',
        format: 'VERTICAL_REEL',
        offerType: 'TWO_FOR_ONE',
        offerBadge: '2x1 JUEVES',
        accentGradient: 'from-red-600 to-rose-700',
        estimatedReach: 98000,
        daysActive: 6,
        isActive: true,
        targetAudience: 'Estudiantes & Jóvenes Profesionales • 18-28 años',
      },

      // KFC
      {
        companyId: kfc.id,
        headline: '🔥 Mega Bucket 10 Piezas + 4 Tiras Krunch por $11.50',
        bodyText:
          'Cuando el hambre de tu grupo es seria, el Coronel responde. Llévate 10 piezas de nuestra receta secreta o extra crujiente + 4 Tiras Krunch + Ensalada de col grande + 4 salsas BBQ y Mostaza Dulce. ¡Pídelo antes de que se acabe!',
        callToAction: 'ORDER_NOW',
        platform: 'FACEBOOK',
        format: 'BANNER_SQUARE',
        offerType: 'COMBO',
        offerBadge: 'MEGA BUCKET $11.50',
        accentGradient: 'from-red-700 via-red-800 to-amber-600',
        estimatedReach: 210000,
        daysActive: 21,
        isActive: true,
        targetAudience: 'Familias y grupos de amigos • 20-50 años',
      },
      {
        companyId: kfc.id,
        headline: '⚡ 40% de Descuento en tu primer pedido exclusivo por la App',
        bodyText:
          'Descarga la App oficial de KFC, ingresa el código KRUNCH40 y disfruta de 40% OFF directo en tu primer pedido con entrega sin contacto. ¡Saltate la fila y come como un rey!',
        callToAction: 'INSTALL_APP',
        platform: 'INSTAGRAM',
        format: 'VERTICAL_REEL',
        offerType: 'DISCOUNT',
        offerBadge: '40% OFF APP',
        accentGradient: 'from-rose-600 to-red-800',
        estimatedReach: 175000,
        daysActive: 18,
        isActive: true,
        targetAudience: 'Usuarios móviles • Amantes del delivery • 18-35 años',
      },

      // PEDIDOSYA
      {
        companyId: pedidosYa.id,
        headline: '🛵 ¿Hambre en casa? Tu envío es 100% GRATIS hoy',
        bodyText:
          'No salgas ni cocines. Abre PedidosYa, elige tu restaurante favorito (Hamburguesas, Sushi, Pizza, Pollo) y disfruta de costo de envío $0.00 en pedidos superiores a $6. ¡Válido por tiempo limitado!',
        callToAction: 'ORDER_NOW',
        platform: 'INSTAGRAM',
        format: 'VERTICAL_REEL',
        offerType: 'FREE_DELIVERY',
        offerBadge: 'ENVÍO GRATIS',
        accentGradient: 'from-red-500 via-pink-600 to-rose-700',
        estimatedReach: 320000,
        daysActive: 10,
        isActive: true,
        targetAudience: 'Trabajadores remotos & Familias • 22-45 años',
      },

      // YUMMY
      {
        companyId: yummy.id,
        headline: '💜 Pide tu comida y recibe $3.00 de cashback para tu próximo Taxi',
        bodyText:
          'El ecosistema que te premia. Haz cualquier pedido de comida en Yummy Food y acumula $3 de crédito en tu Yummy Wallet para usarlo en tu siguiente traslado en Yummy Rides. ¡Doble beneficio!',
        callToAction: 'GET_OFFER',
        platform: 'TIKTOK',
        format: 'VERTICAL_REEL',
        offerType: 'DISCOUNT',
        offerBadge: '$3 CASHBACK',
        accentGradient: 'from-purple-600 to-indigo-700',
        estimatedReach: 190000,
        daysActive: 8,
        isActive: true,
        targetAudience: 'Usuarios urbanos frecuentes • 20-38 años',
      },

      // FARMATODO
      {
        companyId: farmatodo.id,
        headline: '✨ Semana del Cuidado de la Piel: 25% OFF en Dermocosmética',
        bodyText:
          'Protege tu piel con las marcas líderes recomendadas por dermatólogos: La Roche-Posay, CeraVe, Eucerin e ISDIN. Compra en web o app con delivery express en menos de 45 minutos.',
        callToAction: 'GET_OFFER',
        platform: 'INSTAGRAM',
        format: 'CAROUSEL',
        offerType: 'DISCOUNT',
        offerBadge: '25% OFF DERMO',
        accentGradient: 'from-blue-600 to-cyan-500',
        estimatedReach: 240000,
        daysActive: 15,
        isActive: true,
        targetAudience: 'Interesados en Skincare, Salud & Belleza • 18-50 años',
      },

      // RIDERY
      {
        companyId: ridery.id,
        headline: '🚗 Tarifa Plana en Horas Pico: Olvídate de los aumentos sorpresa',
        bodyText:
          '¿Lluvia o tráfico pesado? En Ridery tus traslados mantienen tarifas transparentes y justas sin multiplicadores desmedidos. Conductores verificados con monitoreo GPS 24/7.',
        callToAction: 'INSTALL_APP',
        platform: 'FACEBOOK',
        format: 'BANNER_SQUARE',
        offerType: 'DISCOUNT',
        offerBadge: 'TARIFA FIJA',
        accentGradient: 'from-emerald-500 to-teal-700',
        estimatedReach: 160000,
        daysActive: 12,
        isActive: true,
        targetAudience: 'Usuarios de movilidad diaria • 21-55 años',
      },

      // APPLE
      {
        companyId: apple.id,
        headline: '📱 iPhone 16 Pro: El poder de Apple Intelligence en tus manos',
        bodyText:
          'Diseñado en titanio aeroespacial de grado 5 con el chip A18 Pro más avanzado del mundo. Descubre la nueva era del botón Control de Cámara y audio de estudio profesional.',
        callToAction: 'LEARN_MORE',
        platform: 'GOOGLE_ADS',
        format: 'BANNER_SQUARE',
        offerType: 'NEW_LAUNCH',
        offerBadge: 'NUEVO LANZAMIENTO',
        accentGradient: 'from-slate-700 via-gray-800 to-zinc-950',
        estimatedReach: 500000,
        daysActive: 30,
        isActive: true,
        targetAudience: 'Entusiastas de la tecnología, Creativos & Profesionales',
      },

      // SAMSUNG
      {
        companyId: samsung.id,
        headline: '✨ Galaxy S24 Ultra con Galaxy Buds3 Pro DE REGALO en preventa',
        bodyText:
          'Círculo para buscar de Google, traducción simultánea de llamadas en tiempo real y zoom óptico cuádruple de 200 MP con Nightography. Llévate tus audífonos gratis comprando hoy.',
        callToAction: 'GET_OFFER',
        platform: 'INSTAGRAM',
        format: 'CAROUSEL',
        offerType: 'BUNDLE',
        offerBadge: 'BUDS3 DE REGALO',
        accentGradient: 'from-blue-700 via-indigo-800 to-violet-900',
        estimatedReach: 480000,
        daysActive: 25,
        isActive: true,
        targetAudience: 'Gamers, Fotógrafos móviles & Ejecutivos • 20-50 años',
      },

      // PLAYSTATION
      {
        companyId: playstation.id,
        headline: '🎮 PlayStation Plus Black Season: 33% OFF en suscripción anual',
        bodyText:
          'Accede a cientos de títulos taquilleros en el catálogo de juegos, multijugador online sin límites, pruebas de juegos exclusivos y descuentos VIP semanales.',
        callToAction: 'GET_OFFER',
        platform: 'INSTAGRAM',
        format: 'VERTICAL_REEL',
        offerType: 'DISCOUNT',
        offerBadge: '33% OFF PLUS',
        accentGradient: 'from-blue-800 to-indigo-950',
        estimatedReach: 280000,
        daysActive: 9,
        isActive: true,
        targetAudience: 'Gamers & Creadores de contenido • 16-35 años',
      },

      // XBOX
      {
        companyId: xbox.id,
        headline: '💚 Tu primer mes de Game Pass Ultimate por solo $1.00',
        bodyText:
          'Juega más de 400 videojuegos de consola, PC y la nube desde tu televisor, laptop o teléfono. Juega los títulos de Xbox Game Studios desde el primer día de su lanzamiento.',
        callToAction: 'GET_OFFER',
        platform: 'TIKTOK',
        format: 'VERTICAL_REEL',
        offerType: 'DISCOUNT',
        offerBadge: '$1 PRIMER MES',
        accentGradient: 'from-emerald-600 via-green-700 to-zinc-900',
        estimatedReach: 350000,
        daysActive: 16,
        isActive: true,
        targetAudience: 'Comunidad Gamer & Estudiantes • 15-32 años',
      },
    ],
  });

  // 4. TABLERO DE INSPIRACIÓN DE EJEMPLO (Swipe File)
  const board = await prisma.board.create({
    data: {
      title: 'Estrategias de Combos de Comida Rápida (Q4)',
      description: 'Análisis de precios de Arturo\'s y KFC para definir nuestra próxima campaña de temporada.',
      colorTag: '#F59E0B',
    },
  });

  const allAds = await prisma.ad.findMany();
  if (allAds.length >= 2) {
    await prisma.boardItem.createMany({
      data: [
        {
          boardId: board.id,
          adId: allAds[0].id,
          userNote: 'Interesante usar 8 piezas + 2 acompañamientos como ancla por debajo de los $10.',
        },
        {
          boardId: board.id,
          adId: allAds[1].id,
          userNote: 'El 2x1 en días fijos (jueves) genera hábito de compra recurrente en semana.',
        },
      ],
    });
  }

  console.log('✅ Base de datos adradar_db poblada con éxito con marcas, anuncios y pares de competencia!');
}

main()
  .catch((e) => {
    console.error('❌ Error sembrando base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
