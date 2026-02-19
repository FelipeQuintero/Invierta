import type { APIRoute } from 'astro';
import { getDepartamentos, getCiudades, getZonas, getBarrios } from '../../lib/simi';

export const prerender = false;

export interface LocationEntry {
  name: string;
  type: 'departamento' | 'ciudad' | 'zona' | 'barrio';
  city?: string;
  department?: string;
  simiId: string;
  simiCityId?: string;
}

// In-memory cache with 24h TTL
let cachedLocations: LocationEntry[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function buildLocationCatalog(): Promise<LocationEntry[]> {
  const now = Date.now();
  if (cachedLocations && now - cacheTimestamp < CACHE_TTL) {
    return cachedLocations;
  }

  const entries: LocationEntry[] = [];

  const departamentos = await getDepartamentos();
  for (const dep of departamentos) {
    entries.push({
      name: dep.nombre,
      type: 'departamento',
      simiId: dep.id,
    });
  }

  // Fetch cities for each department in parallel
  const ciudadResults = await Promise.allSettled(
    departamentos.map(async (dep) => {
      const ciudades = await getCiudades(Number(dep.id));
      return { dep, ciudades };
    })
  );

  // Collect all cities with their department info
  const allCities: Array<{ id: string; nombre: string; depNombre: string }> = [];
  for (const result of ciudadResults) {
    if (result.status === 'fulfilled') {
      const { dep, ciudades } = result.value;
      for (const city of ciudades) {
        entries.push({
          name: city.nombre,
          type: 'ciudad',
          department: dep.nombre,
          simiId: city.id,
        });
        allCities.push({ id: city.id, nombre: city.nombre, depNombre: dep.nombre });
      }
    }
  }

  // Fetch zonas and barrios for each city in parallel (batched to avoid overwhelming the API)
  const BATCH_SIZE = 5;
  for (let i = 0; i < allCities.length; i += BATCH_SIZE) {
    const batch = allCities.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (city) => {
        const [zonas, barrios] = await Promise.allSettled([
          getZonas(city.id),
          getBarrios(city.id),
        ]);
        return { city, zonas, barrios };
      })
    );

    for (const result of results) {
      if (result.status !== 'fulfilled') continue;
      const { city, zonas, barrios } = result.value;

      if (zonas.status === 'fulfilled') {
        for (const zona of zonas.value) {
          entries.push({
            name: zona.nombre,
            type: 'zona',
            city: city.nombre,
            department: city.depNombre,
            simiId: zona.id,
            simiCityId: city.id,
          });
        }
      }

      if (barrios.status === 'fulfilled') {
        for (const barrio of barrios.value) {
          entries.push({
            name: barrio.nombre,
            type: 'barrio',
            city: city.nombre,
            department: city.depNombre,
            simiId: barrio.id,
            simiCityId: city.id,
          });
        }
      }
    }
  }

  cachedLocations = entries;
  cacheTimestamp = now;
  console.log(`[Locations] Built catalog with ${entries.length} entries`);
  return entries;
}

export const GET: APIRoute = async () => {
  try {
    const locations = await buildLocationCatalog();
    return new Response(JSON.stringify({ data: locations, count: locations.length }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[Locations] Error building catalog:', error);
    const message = error instanceof Error ? error.message : 'Error interno del servidor';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
