const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando siembra de datos de MenuPulse en Neon PostgreSQL...");

  // 1. Limpiar datos existentes en el esquema menupulse
  await prisma.watchlistItem.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.marginSimulation.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash de contraseña estándar
  const passwordHash = await bcrypt.hash("123456", 10);

  // 3. Crear Usuarios Demo
  const directorUser = await prisma.user.create({
    data: {
      email: "director@foodgroup.com",
      password: passwordHash,
      name: "David González",
      role: "DIRECTOR",
      company: "FoodGroup Hospitality",
      avatarColor: "#059669",
    },
  });

  const analystUser = await prisma.user.create({
    data: {
      email: "analista@burgerlab.io",
      password: passwordHash,
      name: "Valeria Rivas",
      role: "ANALYST",
      company: "BurgerLab Intelligence",
      avatarColor: "#D97706",
    },
  });

  console.log("✅ Usuarios demo creados con éxito");

  // 4. Crear Cadenas de Restaurantes
  const mcdonalds = await prisma.restaurant.create({
    data: {
      name: "McDonald's",
      slug: "mcdonalds",
      category: "FAST_FOOD",
      physicalAddress: "Av. Principal Las Mercedes, Caracas",
      logoColor: "#E11D48",
      logoIcon: "Utensils",
      avgMarkupPct: 34.2,
    },
  });

  const burgerKing = await prisma.restaurant.create({
    data: {
      name: "Burger King",
      slug: "burger-king",
      category: "FAST_FOOD",
      physicalAddress: "C.C. Sambil Chacao, Nivel Autopista",
      logoColor: "#D97706",
      logoIcon: "Flame",
      avgMarkupPct: 31.8,
    },
  });

  const kfc = await prisma.restaurant.create({
    data: {
      name: "KFC",
      slug: "kfc",
      category: "CHICKEN",
      physicalAddress: "Av. Francisco de Miranda, Chacao",
      logoColor: "#DC2626",
      logoIcon: "Drumstick",
      avgMarkupPct: 29.5,
    },
  });

  const arturos = await prisma.restaurant.create({
    data: {
      name: "Arturo's",
      slug: "arturos",
      category: "CHICKEN",
      physicalAddress: "Av. Casanova, Sabana Grande",
      logoColor: "#EA580C",
      logoIcon: "Sparkles",
      avgMarkupPct: 18.4,
    },
  });

  const papaJohns = await prisma.restaurant.create({
    data: {
      name: "Papa John's",
      slug: "papa-johns",
      category: "PIZZA",
      physicalAddress: "Plaza Alfredo Sadel, Las Mercedes",
      logoColor: "#059669",
      logoIcon: "Pizza",
      avgMarkupPct: 36.5,
    },
  });

  const dominos = await prisma.restaurant.create({
    data: {
      name: "Domino's Pizza",
      slug: "dominos",
      category: "PIZZA",
      physicalAddress: "Av. Blandín, La Castellana",
      logoColor: "#2563EB",
      logoIcon: "Pizza",
      avgMarkupPct: 24.1,
    },
  });

  const bonsai = await prisma.restaurant.create({
    data: {
      name: "Bonsai Sushi",
      slug: "bonsai-sushi",
      category: "SUSHI",
      physicalAddress: "C.C. Tolón Fashion Mall, Piso 4",
      logoColor: "#7C3AED",
      logoIcon: "Fish",
      avgMarkupPct: 38.0,
    },
  });

  const starbucks = await prisma.restaurant.create({
    data: {
      name: "Starbucks Café",
      slug: "starbucks",
      category: "COFFEE",
      physicalAddress: "Distrito Financiero / El Rosal",
      logoColor: "#047857",
      logoIcon: "Coffee",
      avgMarkupPct: 41.5,
    },
  });

  const avilaBurger = await prisma.restaurant.create({
    data: {
      name: "Ávila Burger",
      slug: "avila-burger",
      category: "FAST_FOOD",
      physicalAddress: "Cuadra Gastronómica, Los Palos Grandes",
      logoColor: "#B45309",
      logoIcon: "UtensilsCrossed",
      avgMarkupPct: 22.0,
    },
  });

  console.log("✅ Cadenas de restaurantes creadas");

  // Helper para calcular % Markup promedio
  function calcMarkup(phys, py, uber, yummy) {
    const avgDelivery = (py + uber + yummy) / 3;
    return Number((((avgDelivery - phys) / phys) * 100).toFixed(1));
  }

  // 5. Crear Platos con Brechas Físicas vs Delivery
  const dishesData = [
    // McDonald's
    {
      restaurantId: mcdonalds.id,
      name: "Combo Cuarto de Libra con Queso",
      category: "Hamburguesas",
      description: "Carne 100% de res, dos rebanadas de queso cheddar, cebolla y pepinillos con papas y refresco.",
      physicalPrice: 7.50,
      pedidosYaPrice: 10.20,
      uberEatsPrice: 10.50,
      yummyPrice: 9.90,
      phantomMarkupPct: calcMarkup(7.50, 10.20, 10.50, 9.90),
      badge: "🔥 Mayor Sobreprecio",
      foodCostEst: 2.40,
      isSurgeActive: true,
    },
    {
      restaurantId: mcdonalds.id,
      name: "Big Mac Mediano",
      category: "Hamburguesas",
      description: "Dos hamburguesas de carne, salsa especial, lechuga, queso, pepinillos y cebolla en pan con sésamo.",
      physicalPrice: 6.80,
      pedidosYaPrice: 9.20,
      uberEatsPrice: 9.50,
      yummyPrice: 8.90,
      phantomMarkupPct: calcMarkup(6.80, 9.20, 9.50, 8.90),
      badge: "⭐ Más Vendido",
      foodCostEst: 2.10,
      isSurgeActive: false,
    },
    {
      restaurantId: mcdonalds.id,
      name: "Cajita Feliz 4 Nuggets",
      category: "Infantil",
      description: "4 McNuggets de pollo crujiente, papas kids, jugo de naranja y juguete coleccionable.",
      physicalPrice: 5.00,
      pedidosYaPrice: 6.80,
      uberEatsPrice: 7.00,
      yummyPrice: 6.60,
      phantomMarkupPct: calcMarkup(5.00, 6.80, 7.00, 6.60),
      badge: null,
      foodCostEst: 1.60,
      isSurgeActive: false,
    },
    {
      restaurantId: mcdonalds.id,
      name: "McFlurry Oreo Grande",
      category: "Postres",
      description: "Helado cremoso de vainilla con trozos crujientes de galleta Oreo.",
      physicalPrice: 3.20,
      pedidosYaPrice: 4.60,
      uberEatsPrice: 4.80,
      yummyPrice: 4.50,
      phantomMarkupPct: calcMarkup(3.20, 4.60, 4.80, 4.50),
      badge: "🔥 Mayor Sobreprecio",
      foodCostEst: 0.90,
      isSurgeActive: true,
    },

    // Burger King
    {
      restaurantId: burgerKing.id,
      name: "Combo Whopper Doble con Queso",
      category: "Hamburguesas",
      description: "Dos carnes a la parrilla de res, tomate, lechuga, mayonesa, ketchup y pepinillos.",
      physicalPrice: 7.90,
      pedidosYaPrice: 10.40,
      uberEatsPrice: 10.80,
      yummyPrice: 10.20,
      phantomMarkupPct: calcMarkup(7.90, 10.40, 10.80, 10.20),
      badge: "⭐ Duelo Whopper",
      foodCostEst: 2.70,
      isSurgeActive: true,
    },
    {
      restaurantId: burgerKing.id,
      name: "King de Pollo Clásico",
      category: "Pollo",
      description: "Filete empanizado de pechuga de pollo, lechuga fresca y mayonesa en pan alargado con ajonjolí.",
      physicalPrice: 6.00,
      pedidosYaPrice: 7.90,
      uberEatsPrice: 8.20,
      yummyPrice: 7.80,
      phantomMarkupPct: calcMarkup(6.00, 7.90, 8.20, 7.80),
      badge: null,
      foodCostEst: 1.95,
      isSurgeActive: false,
    },
    {
      restaurantId: burgerKing.id,
      name: "Aros de Cebolla King Size",
      category: "Acompañantes",
      description: "Aros de cebolla dorados y crocantes con salsa especial barbacoa o tártara.",
      physicalPrice: 2.80,
      pedidosYaPrice: 3.90,
      uberEatsPrice: 4.20,
      yummyPrice: 3.80,
      phantomMarkupPct: calcMarkup(2.80, 3.90, 4.20, 3.80),
      badge: "🔥 Alto Margen",
      foodCostEst: 0.70,
      isSurgeActive: false,
    },

    // KFC
    {
      restaurantId: kfc.id,
      name: "Mega Variedad 8 Piezas",
      category: "Combos",
      description: "8 piezas de pollo receta secreta o crujiente, 2 ensaladas de col y 4 biscuits.",
      physicalPrice: 14.50,
      pedidosYaPrice: 18.90,
      uberEatsPrice: 19.50,
      yummyPrice: 18.50,
      phantomMarkupPct: calcMarkup(14.50, 18.90, 19.50, 18.50),
      badge: "⭐ Familiar Estrella",
      foodCostEst: 5.10,
      isSurgeActive: true,
    },
    {
      restaurantId: kfc.id,
      name: "Popcorn Chicken Gigante",
      category: "Pollo",
      description: "Bocaditos de 100% pechuga de pollo marinados y empanizados al estilo sureño.",
      physicalPrice: 6.50,
      pedidosYaPrice: 8.60,
      uberEatsPrice: 8.90,
      yummyPrice: 8.40,
      phantomMarkupPct: calcMarkup(6.50, 8.60, 8.90, 8.40),
      badge: null,
      foodCostEst: 2.10,
      isSurgeActive: false,
    },

    // Arturo's
    {
      restaurantId: arturos.id,
      name: "Super Combo 3 Piezas + Pana",
      category: "Combos",
      description: "3 piezas de pollo frito dorado estilo Arturo's, papas fritas, panecillo pana y ensalada rallada.",
      physicalPrice: 7.90,
      pedidosYaPrice: 9.40,
      uberEatsPrice: 9.60,
      yummyPrice: 9.20,
      phantomMarkupPct: calcMarkup(7.90, 9.40, 9.60, 9.20),
      badge: "📉 Precio Honesto",
      foodCostEst: 2.90,
      isSurgeActive: false,
    },
    {
      restaurantId: arturos.id,
      name: "Combo Familiar 12 Piezas",
      category: "Combos",
      description: "12 piezas de pollo frito crujiente con 4 panes, papas familiares y refresco de 1.5L.",
      physicalPrice: 19.90,
      pedidosYaPrice: 23.50,
      uberEatsPrice: 23.90,
      yummyPrice: 23.00,
      phantomMarkupPct: calcMarkup(19.90, 23.50, 23.90, 23.00),
      badge: "📉 Precio Honesto",
      foodCostEst: 7.20,
      isSurgeActive: false,
    },

    // Papa John's
    {
      restaurantId: papaJohns.id,
      name: "Pizza Familiar The Works",
      category: "Pizzas",
      description: "Pepperoni, jamón ahumado, salchicha italiana, champiñones, pimientos verdes y aceitunas negras.",
      physicalPrice: 16.00,
      pedidosYaPrice: 22.50,
      uberEatsPrice: 23.00,
      yummyPrice: 21.90,
      phantomMarkupPct: calcMarkup(16.00, 22.50, 23.00, 21.90),
      badge: "🔥 Mayor Sobreprecio",
      foodCostEst: 4.80,
      isSurgeActive: true,
    },
    {
      restaurantId: papaJohns.id,
      name: "Cheesesticks con Salsa Garlic",
      category: "Entradas",
      description: "Masa fresca cubierta con queso mozzarella horneado y dos salsas especiales de mantequilla de ajo.",
      physicalPrice: 5.50,
      pedidosYaPrice: 7.80,
      uberEatsPrice: 8.20,
      yummyPrice: 7.60,
      phantomMarkupPct: calcMarkup(5.50, 7.80, 8.20, 7.60),
      badge: "🔥 Alto Margen",
      foodCostEst: 1.50,
      isSurgeActive: false,
    },

    // Domino's Pizza
    {
      restaurantId: dominos.id,
      name: "Pizza Mediana Pepperoni Fest",
      category: "Pizzas",
      description: "Doble capa de pepperoni crujiente con queso 100% mozzarella fundido.",
      physicalPrice: 11.00,
      pedidosYaPrice: 13.80,
      uberEatsPrice: 14.20,
      yummyPrice: 13.50,
      phantomMarkupPct: calcMarkup(11.00, 13.80, 14.20, 13.50),
      badge: "⭐ Clásico Delivery",
      foodCostEst: 3.30,
      isSurgeActive: false,
    },

    // Bonsai Sushi
    {
      restaurantId: bonsai.id,
      name: "Barco Dragón Especial (30 Piezas)",
      category: "Sushi",
      description: "Roll Dinamita, Roll Tiger frito con anguila, California Especial y Croquetas de Salmón.",
      physicalPrice: 22.00,
      pedidosYaPrice: 31.00,
      uberEatsPrice: 32.00,
      yummyPrice: 30.00,
      phantomMarkupPct: calcMarkup(22.00, 31.00, 32.00, 30.00),
      badge: "🔥 Mayor Sobreprecio",
      foodCostEst: 7.40,
      isSurgeActive: true,
    },

    // Starbucks
    {
      restaurantId: starbucks.id,
      name: "Caramel Macchiato Venti Helado",
      category: "Café",
      description: "Espresso tostado con jarabe de vainilla, leche vaporizada y llovizna generosa de caramelo.",
      physicalPrice: 5.20,
      pedidosYaPrice: 7.50,
      uberEatsPrice: 7.80,
      yummyPrice: 7.20,
      phantomMarkupPct: calcMarkup(5.20, 7.50, 7.80, 7.20),
      badge: "🔥 Mayor Sobreprecio",
      foodCostEst: 1.10,
      isSurgeActive: true,
    },

    // Ávila Burger
    {
      restaurantId: avilaBurger.id,
      name: "Hamburguesa Ávila Especial con Chistorra",
      category: "Hamburguesas",
      description: "200g de carne angus molida, chistorra artesanal a la plancha, queso gouda y cebolla caramelizada.",
      physicalPrice: 9.50,
      pedidosYaPrice: 11.60,
      uberEatsPrice: 11.90,
      yummyPrice: 11.40,
      phantomMarkupPct: calcMarkup(9.50, 11.60, 11.90, 11.40),
      badge: "📉 Precio Honesto",
      foodCostEst: 3.80,
      isSurgeActive: false,
    },
  ];

  for (const dish of dishesData) {
    await prisma.dish.create({ data: dish });
  }

  console.log(`✅ ${dishesData.length} platos indexados con brechas de precio reales`);

  // 6. Crear Watchlist Inicial para el Director de Operaciones
  const sampleDish = await prisma.dish.findFirst({
    where: { name: "Combo Cuarto de Libra con Queso" },
  });

  const sampleDishArturos = await prisma.dish.findFirst({
    where: { name: "Super Combo 3 Piezas + Pana" },
  });

  if (sampleDish && sampleDishArturos) {
    const watchlist = await prisma.watchlist.create({
      data: {
        userId: directorUser.id,
        title: "Duelo Fast Food: Cuarto de Libra vs Arturo's",
        notes: "Auditoría de sobreprecio: McDonald's cobra +36% en delivery mientras Arturo's apenas incrementa 19%.",
      },
    });

    await prisma.watchlistItem.create({
      data: {
        watchlistId: watchlist.id,
        dishId: sampleDish.id,
        userNote: "Margen inflado para absorber 28% de comisión en PedidosYa.",
      },
    });

    await prisma.watchlistItem.create({
      data: {
        watchlistId: watchlist.id,
        dishId: sampleDishArturos.id,
        userNote: "Estrategia de penetración con markup bajo.",
      },
    });

    console.log("✅ Watchlist privada inicial creada");
  }

  console.log("🎉 ¡Siembra de datos de MenuPulse completada con éxito en Neon!");
}

main()
  .catch((e) => {
    console.error("Error al sembrar:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
