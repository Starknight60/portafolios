// Categorias de lugares donde una persona puede preguntar por trabajo.
// "overpass" = filtros de OpenStreetMap; "terms" = busquedas de respaldo (Nominatim).

export type CategoryId =
  | "supermercados"
  | "comida"
  | "comercio"
  | "hoteles"
  | "salud"
  | "talleres"
  | "industria"
  | "oficinas"
  | "educacion"
  | "belleza"
  | "supermarket"
  | "restaurant"
  | "bakery"
  | "pharmacy"
  | "mechanic"
  | "warehouse"
  | "store"
  | "clinic";

export interface Category {
  id: string;
  name: string;
  label: string;
  short: string;
  color: string;
  emoji: string;
  icon: string;
  overpass: string[];
  terms: string[];
}

export const BASE_CATEGORIES: Category[] = [
  {
    id: "supermercados",
    name: "Supermercados",
    label: "Supermercados y abastos",
    short: "Supermercados",
    color: "#10B981",
    emoji: "🛒",
    icon: "🛒",
    overpass: [`["shop"~"^(supermarket|convenience|greengrocer|wholesale|mall|department_store)$"]`],
    terms: ["supermarket"],
  },
  {
    id: "comida",
    name: "Restaurantes & Cafés",
    label: "Restaurantes y cafeterías",
    short: "Comida",
    color: "#F59E0B",
    emoji: "🍽️",
    icon: "🍽️",
    overpass: [
      `["amenity"~"^(restaurant|fast_food|cafe|bar|pub|food_court|ice_cream)$"]`,
      `["shop"~"^(bakery|butcher|pastry|confectionery)$"]`,
    ],
    terms: ["restaurant", "cafe", "fast food"],
  },
  {
    id: "comercio",
    name: "Tiendas & Comercio",
    label: "Tiendas y comercio",
    short: "Tiendas",
    color: "#8B5CF6",
    emoji: "🛍️",
    icon: "🛍️",
    overpass: [
      `["shop"~"^(clothes|shoes|electronics|mobile_phone|furniture|hardware|variety_store|jewelry|books|sports|toys|gift|bag|optician|chemist|stationery)$"]`,
    ],
    terms: ["clothes shop", "shoe shop", "electronics shop"],
  },
  {
    id: "salud",
    name: "Farmacias & Salud",
    label: "Salud y farmacias",
    short: "Salud",
    color: "#EC4899",
    emoji: "💊",
    icon: "💊",
    overpass: [`["amenity"~"^(pharmacy|clinic|hospital|dentist|doctors|veterinary)$"]`],
    terms: ["pharmacy", "clinic"],
  },
  {
    id: "talleres",
    name: "Talleres & Mecánica",
    label: "Talleres y oficios",
    short: "Talleres",
    color: "#D97706",
    emoji: "🔧",
    icon: "🔧",
    overpass: [
      `["shop"~"^(car_repair|car|tyres|motorcycle|doityourself|car_parts)$"]`,
      `["craft"~"^(carpenter|electrician|plumber|welder|metal_construction|painter|tailor|shoemaker|locksmith)$"]`,
      `["amenity"="car_wash"]`,
    ],
    terms: ["car repair", "car wash"],
  },
  {
    id: "industria",
    name: "Almacenes & Logística",
    label: "Fábricas y almacenes",
    short: "Almacenes",
    color: "#64748B",
    emoji: "📦",
    icon: "📦",
    overpass: [
      `["man_made"="works"]`,
      `["building"~"^(industrial|warehouse|factory)$"]["name"]`,
      `["office"="logistics"]`,
    ],
    terms: ["factory", "warehouse"],
  },
  {
    id: "oficinas",
    name: "Oficinas & Servicios",
    label: "Oficinas y servicios",
    short: "Oficinas",
    color: "#3B82F6",
    emoji: "💼",
    icon: "💼",
    overpass: [
      `["amenity"~"^(bank|post_office|bureau_de_change)$"]`,
      `["office"~"^(company|insurance|employment_agency|it|telecommunication|financial|estate_agent|accountant|lawyer)$"]`,
    ],
    terms: ["bank", "office"],
  },
  {
    id: "hoteles",
    name: "Hoteles & Hospedaje",
    label: "Hoteles y turismo",
    short: "Hoteles",
    color: "#06B6D4",
    emoji: "🏨",
    icon: "🏨",
    overpass: [`["tourism"~"^(hotel|hostel|guest_house|motel|apartment|resort)$"]`],
    terms: ["hotel", "hostel"],
  },
  {
    id: "belleza",
    name: "Belleza & Estética",
    label: "Belleza y estética",
    short: "Belleza",
    color: "#F43F5E",
    emoji: "💇",
    icon: "💇",
    overpass: [
      `["shop"~"^(hairdresser|beauty|cosmetics|massage|tattoo)$"]`,
      `["leisure"~"^(fitness_centre|sports_centre)$"]`,
    ],
    terms: ["hairdresser", "gym"],
  },
];

// Diccionario por ID (soporta tanto nombres en inglés como en español para compatibilidad)
export const CATEGORY_BY_ID: Record<string, Category> = {
  ...Object.fromEntries(BASE_CATEGORIES.map((c) => [c.id, c])),
  supermarket: BASE_CATEGORIES[0],
  restaurant: BASE_CATEGORIES[1],
  bakery: { ...BASE_CATEGORIES[1], name: "Panadería & Pastelería", icon: "🥖", emoji: "🥖" },
  store: BASE_CATEGORIES[2],
  pharmacy: BASE_CATEGORIES[3],
  clinic: { ...BASE_CATEGORIES[3], name: "Clínicas & Asistencia", icon: "🏥", emoji: "🏥" },
  mechanic: BASE_CATEGORIES[4],
  warehouse: BASE_CATEGORIES[5],
};

export const CATEGORIES = CATEGORY_BY_ID;

export const ALL_CATEGORY_IDS = BASE_CATEGORIES.map((c) => c.id);

export function isCategoryId(v: string): boolean {
  return v in CATEGORY_BY_ID;
}

/** Clasifica un conjunto de etiquetas de OpenStreetMap en una de nuestras categorias. */
export function classifyTags(tags: Record<string, string>): string | null {
  const shop = tags.shop;
  const amenity = tags.amenity;
  const tourism = tags.tourism;
  const office = tags.office;
  const craft = tags.craft;
  const leisure = tags.leisure;

  if (shop && /^(supermarket|convenience|greengrocer|wholesale|mall|department_store)$/.test(shop)) return "supermercados";
  if (amenity && /^(restaurant|fast_food|cafe|bar|pub|food_court|ice_cream)$/.test(amenity)) return "comida";
  if (shop && /^(bakery|butcher|pastry|confectionery)$/.test(shop)) return "comida";
  if (tourism && /^(hotel|hostel|guest_house|motel|apartment|resort)$/.test(tourism)) return "hoteles";
  if (amenity && /^(pharmacy|clinic|hospital|dentist|doctors|veterinary)$/.test(amenity)) return "salud";
  if (shop && /^(car_repair|car|tyres|motorcycle|doityourself|car_parts)$/.test(shop)) return "talleres";
  if (craft && /^(carpenter|electrician|plumber|welder|metal_construction|painter|tailor|shoemaker|locksmith)$/.test(craft)) return "talleres";
  if (amenity === "car_wash") return "talleres";
  if (tags.man_made === "works" || office === "logistics") return "industria";
  if (tags.building && /^(industrial|warehouse|factory)$/.test(tags.building)) return "industria";
  if (amenity && /^(bank|post_office|bureau_de_change)$/.test(amenity)) return "oficinas";
  if (office && /^(company|insurance|employment_agency|it|telecommunication|financial|estate_agent|accountant|lawyer)$/.test(office)) return "oficinas";
  if (shop && /^(hairdresser|beauty|cosmetics|massage|tattoo)$/.test(shop)) return "belleza";
  if (leisure && /^(fitness_centre|sports_centre)$/.test(leisure)) return "belleza";
  if (shop && /^(clothes|shoes|electronics|mobile_phone|furniture|hardware|variety_store|jewelry|books|sports|toys|gift|bag|optician|chemist|stationery)$/.test(shop)) return "comercio";
  return null;
}
