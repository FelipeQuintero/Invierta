import Fuse from 'fuse.js';
import type { LocationEntry } from '../pages/api/locations';

export interface LocationSuggestion {
  name: string;
  type: 'departamento' | 'ciudad' | 'zona' | 'barrio';
  city?: string;
  department?: string;
  simiId: string;
  simiCityId?: string;
  score: number;
}

const TYPE_LABELS: Record<LocationSuggestion['type'], string> = {
  departamento: 'Departamento',
  ciudad: 'Ciudad',
  zona: 'Zona',
  barrio: 'Barrio',
};

export function getTypeLabel(type: LocationSuggestion['type']): string {
  return TYPE_LABELS[type];
}

let fuseInstance: Fuse<LocationEntry> | null = null;
let catalogData: LocationEntry[] = [];
let fetchPromise: Promise<void> | null = null;

async function ensureCatalog(): Promise<void> {
  if (catalogData.length > 0) return;
  if (fetchPromise) {
    await fetchPromise;
    return;
  }

  fetchPromise = (async () => {
    try {
      const response = await fetch('/api/locations');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      catalogData = json.data || [];
      fuseInstance = new Fuse(catalogData, {
        keys: ['name'],
        threshold: 0.4,
        distance: 100,
        minMatchCharLength: 2,
        includeScore: true,
      });
    } catch (error) {
      console.error('[LocationSearch] Failed to load catalog:', error);
      catalogData = [];
      fuseInstance = null;
    } finally {
      fetchPromise = null;
    }
  })();

  await fetchPromise;
}

export async function getSuggestions(query: string, limit = 8): Promise<LocationSuggestion[]> {
  if (!query || query.length < 2) return [];

  await ensureCatalog();
  if (!fuseInstance) return [];

  const results = fuseInstance.search(query, { limit });
  return results.map((r) => ({
    name: r.item.name,
    type: r.item.type,
    city: r.item.city,
    department: r.item.department,
    simiId: r.item.simiId,
    simiCityId: r.item.simiCityId,
    score: r.score ?? 1,
  }));
}

export async function getDidYouMean(query: string): Promise<string | null> {
  if (!query || query.length < 2) return null;

  await ensureCatalog();
  if (!fuseInstance) return null;

  const results = fuseInstance.search(query, { limit: 1 });
  if (results.length === 0) return null;

  const best = results[0];
  // Only suggest if the match is reasonable (score < 0.6)
  if (best.score !== undefined && best.score < 0.6) {
    return best.item.name;
  }
  return null;
}

export function preloadCatalog(): void {
  ensureCatalog();
}
