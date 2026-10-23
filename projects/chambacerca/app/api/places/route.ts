import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { calculateDistanceMeters, getBoundingBox, formatDistance } from '@/lib/geo';
import { CATEGORIES } from '@/lib/categories';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface PlaceResultItem {
  id: string;
  source: 'VACANCY' | 'COMMUNITY_REPORT' | 'COMMERCIAL_PLACE';
  placeName: string;
  title?: string;
  category: string;
  categoryLabel: string;
  categoryIcon: string;
  categoryColor: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  distanceFormatted: string;
  walkTimeMinutes: number;
  status: 'VERIFIED_VACANCY' | 'COMMUNITY_HIRING' | 'COMMUNITY_NOT_HIRING' | 'POTENTIAL_PLACE';
  salaryRange?: string | null;
  schedule?: string | null;
  howToApply?: string | null;
  contactWhatsapp?: string | null;
  contactPhone?: string | null;
  applyInstructions?: string | null;
  description?: string | null;
  requirements?: string[];
  benefits?: string[];
  reportCount?: number;
  recentComment?: string | null;
  contactTip?: string | null;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const radiusParam = searchParams.get('radius');
    const categoryParam = searchParams.get('category');

    // Ubicación por defecto: Caracas (Plaza Altamira / Chacao)
    const userLat = latParam ? parseFloat(latParam) : 10.4960;
    const userLng = lngParam ? parseFloat(lngParam) : -66.8520;
    const radiusMeters = radiusParam ? Math.min(Math.max(parseInt(radiusParam, 10), 300), 10000) : 2000;
    const selectedCategory = categoryParam && categoryParam !== 'all' ? categoryParam : null;

    if (isNaN(userLat) || isNaN(userLng)) {
      return NextResponse.json(
        { error: 'Coordenadas de latitud o longitud inválidas.' },
        { status: 400 }
      );
    }

    const bbox = getBoundingBox(userLat, userLng, radiusMeters);

    // 1. Consultar Vacantes Verificadas en Neon
    let vacanciesQuery = `
      SELECT 
        v."id", v."title", v."description", v."placeName", v."category",
        v."address", v."latitude", v."longitude", v."jobType", v."schedule",
        v."salaryRange", v."howToApply", v."contactPhone", v."contactWhatsapp",
        v."contactEmail", v."applyInstructions", v."requirements", v."benefits",
        v."updatedAt"
      FROM chambacerca."Vacancy" v
      WHERE v."status" = 'ACTIVE'
        AND v."expiresAt" > NOW()
        AND v."latitude" BETWEEN $1 AND $2
        AND v."longitude" BETWEEN $3 AND $4
    `;
    const vacanciesParams: any[] = [bbox.minLat, bbox.maxLat, bbox.minLng, bbox.maxLng];

    if (selectedCategory) {
      vacanciesParams.push(selectedCategory);
      vacanciesQuery += ` AND v."category" = $${vacanciesParams.length}`;
    }

    const vacancies = ((await (sql as any).query(vacanciesQuery, vacanciesParams)) || []) as any[];

    // 2. Consultar Reportes de la Comunidad
    let reportsQuery = `
      SELECT 
        r."id", r."placeOsmId", r."placeName", r."category", r."latitude", r."longitude",
        r."status", r."roleHiring", r."comment", r."contactTip", r."upvotes", r."createdAt"
      FROM chambacerca."PlaceReport" r
      WHERE r."expiresAt" > NOW()
        AND r."latitude" BETWEEN $1 AND $2
        AND r."longitude" BETWEEN $3 AND $4
    `;
    const reportsParams: any[] = [bbox.minLat, bbox.maxLat, bbox.minLng, bbox.maxLng];

    if (selectedCategory) {
      reportsParams.push(selectedCategory);
      reportsQuery += ` AND r."category" = $${reportsParams.length}`;
    }

    const reports = ((await (sql as any).query(reportsQuery, reportsParams)) || []) as any[];

    // 3. Consultar Lugares Potenciales de Empleo en Caché
    let cacheQuery = `
      SELECT 
        c."id", c."osmId", c."name", c."category", c."address", c."latitude", c."longitude",
        c."phone", c."openingHours", c."updatedAt"
      FROM chambacerca."PlaceCache" c
      WHERE c."latitude" BETWEEN $1 AND $2
        AND c."longitude" BETWEEN $3 AND $4
    `;
    const cacheParams: any[] = [bbox.minLat, bbox.maxLat, bbox.minLng, bbox.maxLng];

    if (selectedCategory) {
      cacheParams.push(selectedCategory);
      cacheQuery += ` AND c."category" = $${cacheParams.length}`;
    }

    const cachedPlaces = ((await (sql as any).query(cacheQuery, cacheParams)) || []) as any[];

    // Si hay muy pocos lugares en caché para esta zona, consultar Photon / Nominatim
    if (cachedPlaces.length < 5) {
      try {
        const queryTerm = selectedCategory ? (CATEGORIES[selectedCategory]?.name || 'comercio') : 'supermercado';
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(queryTerm)}&lat=${userLat}&lon=${userLng}&limit=12`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const resp = await fetch(photonUrl, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
        });
        clearTimeout(timeoutId);

        if (resp.ok) {
          const data = await resp.json();
          if (data && Array.isArray(data.features)) {
            for (const f of data.features) {
              const [lon, lat] = f.geometry?.coordinates || [];
              const props = f.properties || {};
              const placeName = props.name;
              if (lat && lon && placeName) {
                const dist = calculateDistanceMeters(userLat, userLng, lat, lon);
                if (dist <= radiusMeters) {
                  const catKey = selectedCategory || 'store';
                  const osmId = `photon_${props.osm_type || 'N'}_${props.osm_id || Math.random().toString(36).substring(2, 8)}`;
                  const address = [props.street, props.district, props.city].filter(Boolean).join(', ') || 'Zona comercial urbana';

                  (sql as any).query(
                    `
                    INSERT INTO chambacerca."PlaceCache" ("id", "osmId", "name", "category", "address", "latitude", "longitude")
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT ("osmId") DO NOTHING;
                    `,
                    [`pc_${osmId}`, osmId, placeName, catKey, address, lat, lon]
                  ).catch(() => {});

                  cachedPlaces.push({
                    id: `pc_${osmId}`,
                    osmId,
                    name: placeName,
                    category: catKey,
                    address,
                    latitude: lat,
                    longitude: lon,
                    phone: null,
                    openingHours: null,
                    updatedAt: new Date().toISOString(),
                  });
                }
              }
            }
          }
        }
      } catch {
        // Fallback tolerante si falla la llamada externa
      }
    }

    // 4. Unificar y estructurar resultados con cálculo métrico exacto
    const results: PlaceResultItem[] = [];

    // A. Procesar vacantes verificadas
    for (const v of vacancies) {
      const dist = calculateDistanceMeters(userLat, userLng, v.latitude, v.longitude);
      if (dist <= radiusMeters) {
        const catInfo = CATEGORIES[v.category] || CATEGORIES.store;
        results.push({
          id: `vac_${v.id}`,
          source: 'VACANCY',
          placeName: v.placeName,
          title: v.title,
          category: v.category,
          categoryLabel: catInfo?.name || 'Comercio',
          categoryIcon: catInfo?.icon || '💼',
          categoryColor: catInfo?.color || '#10B981',
          address: v.address,
          latitude: v.latitude,
          longitude: v.longitude,
          distanceMeters: Math.round(dist),
          distanceFormatted: formatDistance(dist),
          walkTimeMinutes: Math.max(1, Math.round(dist / 80)),
          status: 'VERIFIED_VACANCY',
          salaryRange: v.salaryRange,
          schedule: v.schedule,
          howToApply: v.howToApply,
          contactWhatsapp: v.contactWhatsapp,
          contactPhone: v.contactPhone,
          applyInstructions: v.applyInstructions,
          description: v.description,
          requirements: Array.isArray(v.requirements) ? v.requirements : [],
          benefits: Array.isArray(v.benefits) ? v.benefits : [],
          updatedAt: v.updatedAt ? new Date(v.updatedAt).toISOString() : new Date().toISOString(),
        });
      }
    }

    // B. Procesar reportes comunitarios
    for (const r of reports) {
      const dist = calculateDistanceMeters(userLat, userLng, r.latitude, r.longitude);
      if (dist <= radiusMeters) {
        const catInfo = CATEGORIES[r.category] || CATEGORIES.store;
        results.push({
          id: `rep_${r.id}`,
          source: 'COMMUNITY_REPORT',
          placeName: r.placeName,
          title: r.roleHiring || (r.status === 'HIRING' ? 'Vacante reportada por vecino' : 'Sin vacantes reportadas'),
          category: r.category,
          categoryLabel: catInfo?.name || 'Comercio',
          categoryIcon: catInfo?.icon || '📢',
          categoryColor: catInfo?.color || '#F59E0B',
          address: 'Ubicación reportada por la comunidad',
          latitude: r.latitude,
          longitude: r.longitude,
          distanceMeters: Math.round(dist),
          distanceFormatted: formatDistance(dist),
          walkTimeMinutes: Math.max(1, Math.round(dist / 80)),
          status: r.status === 'HIRING' ? 'COMMUNITY_HIRING' : 'COMMUNITY_NOT_HIRING',
          recentComment: r.comment,
          contactTip: r.contactTip,
          reportCount: r.upvotes || 1,
          updatedAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
        });
      }
    }

    // C. Procesar lugares potenciales de empleo comercial
    for (const c of cachedPlaces) {
      const dist = calculateDistanceMeters(userLat, userLng, c.latitude, c.longitude);
      if (dist <= radiusMeters) {
        const alreadyHasVacancy = vacancies.some((v: any) => 
          v.placeName.toLowerCase().includes(c.name.toLowerCase()) || 
          c.name.toLowerCase().includes(v.placeName.toLowerCase())
        );
        if (!alreadyHasVacancy) {
          const catInfo = CATEGORIES[c.category] || CATEGORIES.store;
          results.push({
            id: `place_${c.id}`,
            source: 'COMMERCIAL_PLACE',
            placeName: c.name,
            title: `Lugar potencial de empleo (${catInfo?.name || 'Comercio'})`,
            category: c.category,
            categoryLabel: catInfo?.name || 'Comercio',
            categoryIcon: catInfo?.icon || '🏬',
            categoryColor: catInfo?.color || '#3B82F6',
            address: c.address || 'Zona comercial',
            latitude: c.latitude,
            longitude: c.longitude,
            distanceMeters: Math.round(dist),
            distanceFormatted: formatDistance(dist),
            walkTimeMinutes: Math.max(1, Math.round(dist / 80)),
            status: 'POTENTIAL_PLACE',
            contactPhone: c.phone || null,
            applyInstructions: 'Lugar con actividad económica activa. Acércate con tu currículo impreso y solicita hablar con el encargado.',
            updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
          });
        }
      }
    }

    const statusPriority: Record<string, number> = {
      VERIFIED_VACANCY: 1,
      COMMUNITY_HIRING: 2,
      POTENTIAL_PLACE: 3,
      COMMUNITY_NOT_HIRING: 4,
    };

    results.sort((a, b) => {
      const pDiff = (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
      if (pDiff !== 0) return pDiff;
      return a.distanceMeters - b.distanceMeters;
    });

    const summary = {
      totalFound: results.length,
      verifiedVacancies: results.filter(r => r.status === 'VERIFIED_VACANCY').length,
      communityReports: results.filter(r => r.status === 'COMMUNITY_HIRING' || r.status === 'COMMUNITY_NOT_HIRING').length,
      potentialPlaces: results.filter(r => r.status === 'POTENTIAL_PLACE').length,
      center: { lat: userLat, lng: userLng },
      radiusMeters,
    };

    return NextResponse.json({
      success: true,
      summary,
      places: results,
    });
  } catch (err: any) {
    console.error('Error in /api/places:', err);
    return NextResponse.json(
      { error: 'Error al consultar oportunidades laborales cercanas.', details: err.message },
      { status: 500 }
    );
  }
}
