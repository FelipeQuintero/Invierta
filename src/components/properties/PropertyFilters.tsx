import { useState, useCallback, useEffect } from 'react';
import {
  PROPERTY_TYPES,
  CITIES,
  BEDROOM_OPTIONS,
  BATHROOM_OPTIONS,
  PARKING_OPTIONS,
  STRATUM_OPTIONS,
  PRICE_RANGES_VENTA,
  PRICE_RANGES_ARRIENDO,
} from '../../lib/constants';
import LoadingSpinner from '../ui/LoadingSpinner';
import LocationAutocomplete from '../ui/LocationAutocomplete';
import type { LocationSuggestion } from '../../lib/locationSearch';

interface Props {
  operation: string;
  onLoadingChange?: (isLoading: boolean) => void;
}

const SearchIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const ClearIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="4" y1="21" y2="14" />
    <line x1="4" x2="4" y1="10" y2="3" />
    <line x1="12" x2="12" y1="21" y2="12" />
    <line x1="12" x2="12" y1="8" y2="3" />
    <line x1="20" x2="20" y1="21" y2="16" />
    <line x1="20" x2="20" y1="12" y2="3" />
    <line x1="2" x2="6" y1="14" y2="14" />
    <line x1="10" x2="14" y1="8" y2="8" />
    <line x1="18" x2="22" y1="16" y2="16" />
  </svg>
);

const CodeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7 7 10 10" />
    <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[var(--color-border)] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-left"
      >
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</span>
        <ChevronIcon isOpen={open} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          open ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0 pb-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function PropertyFilters({ operation, onLoadingChange }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [code, setCode] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [city, setCity] = useState('');
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [parking, setParking] = useState('');
  const [stratum, setStratum] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('code')) setCode(params.get('code') || '');
    if (params.get('locationQuery')) setLocationQuery(params.get('locationQuery') || '');
    if (params.get('city')) setCity(params.get('city') || '');
    if (params.get('propertyType')) {
      const val = params.get('propertyType') || '';
      setPropertyTypes(val.includes(',') ? val.split(',') : val ? [val] : []);
    }
    if (params.get('minPrice')) setMinPrice(params.get('minPrice') || '');
    if (params.get('maxPrice')) setMaxPrice(params.get('maxPrice') || '');
    if (params.get('bedrooms')) setBedrooms(params.get('bedrooms') || '');
    if (params.get('minArea')) setMinArea(params.get('minArea') || '');
    if (params.get('maxArea')) setMaxArea(params.get('maxArea') || '');
    if (params.get('bathrooms')) setBathrooms(params.get('bathrooms') || '');
    if (params.get('parking')) setParking(params.get('parking') || '');
    if (params.get('stratum')) setStratum(params.get('stratum') || '');
  }, []);

  const setLoadingState = useCallback(
    (loading: boolean) => {
      setIsLoading(loading);
      onLoadingChange?.(loading);
    },
    [onLoadingChange]
  );

  function buildParams(): URLSearchParams {
    const params = new URLSearchParams();
    if (code) params.set('code', code);
    if (locationQuery) params.set('locationQuery', locationQuery);
    if (city) params.set('city', city);
    if (propertyTypes.length === 1) params.set('propertyType', propertyTypes[0]);
    if (propertyTypes.length > 1) params.set('propertyType', propertyTypes.join(','));
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (minArea) params.set('minArea', minArea);
    if (maxArea) params.set('maxArea', maxArea);
    if (bathrooms) params.set('bathrooms', bathrooms);
    if (parking) params.set('parking', parking);
    if (stratum) params.set('stratum', stratum);
    return params;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoadingState(true);
    const params = buildParams();
    const queryString = params.toString();
    const currentPath = window.location.pathname;
    window.location.href = queryString ? `${currentPath}?${queryString}` : currentPath;
  }

  function handleClear() {
    setLoadingState(true);
    setCode('');
    setLocationQuery('');
    setCity('');
    setPropertyTypes([]);
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setMinArea('');
    setMaxArea('');
    setBathrooms('');
    setParking('');
    setStratum('');
    window.location.href = window.location.pathname;
  }

  function togglePropertyType(value: string) {
    setPropertyTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function handlePriceRange(min: number, max: number) {
    setMinPrice(min.toString());
    setMaxPrice(max === Infinity ? '' : max.toString());
  }

  function removeFilter(key: string) {
    switch (key) {
      case 'code': setCode(''); break;
      case 'locationQuery': setLocationQuery(''); break;
      case 'city': setCity(''); break;
      case 'propertyType': setPropertyTypes([]); break;
      case 'minPrice': setMinPrice(''); break;
      case 'maxPrice': setMaxPrice(''); break;
      case 'bedrooms': setBedrooms(''); break;
      case 'minArea': setMinArea(''); break;
      case 'maxArea': setMaxArea(''); break;
      case 'bathrooms': setBathrooms(''); break;
      case 'parking': setParking(''); break;
      case 'stratum': setStratum(''); break;
    }
  }

  const activeFilters: { key: string; label: string }[] = [];
  if (code) activeFilters.push({ key: 'code', label: `Codigo: ${code}` });
  if (locationQuery) activeFilters.push({ key: 'locationQuery', label: locationQuery });
  if (city) activeFilters.push({ key: 'city', label: city });
  if (propertyTypes.length > 0) {
    const labels = propertyTypes
      .map((v) => PROPERTY_TYPES.find((pt) => pt.value === v)?.label || v)
      .join(', ');
    activeFilters.push({ key: 'propertyType', label: labels });
  }
  if (minPrice) activeFilters.push({ key: 'minPrice', label: `Min: $${Number(minPrice).toLocaleString('es-CO')}` });
  if (maxPrice) activeFilters.push({ key: 'maxPrice', label: `Max: $${Number(maxPrice).toLocaleString('es-CO')}` });
  if (bedrooms) activeFilters.push({ key: 'bedrooms', label: `${bedrooms}+ hab.` });
  if (minArea) activeFilters.push({ key: 'minArea', label: `Min: ${minArea} m\u00B2` });
  if (maxArea) activeFilters.push({ key: 'maxArea', label: `Max: ${maxArea} m\u00B2` });
  if (bathrooms) activeFilters.push({ key: 'bathrooms', label: `${bathrooms}+ baños` });
  if (parking) activeFilters.push({ key: 'parking', label: `${parking}+ parq.` });
  if (stratum) activeFilters.push({ key: 'stratum', label: `Estrato ${stratum}` });

  const hasActiveFilters = activeFilters.length > 0;

  const priceRanges = operation === 'arriendo' ? PRICE_RANGES_ARRIENDO : PRICE_RANGES_VENTA;

  const inputClass =
    'w-full h-10 px-3 bg-white border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all duration-200';

  const selectClass =
    "w-full h-10 px-3 bg-white border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all duration-200 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%234a5568%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_12px_center] bg-no-repeat pr-9";

  const chipClass = (active: boolean) =>
    `px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-150 cursor-pointer ${
      active
        ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
        : 'bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
    }`;

  const sidebarContent = (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto px-4 lg:px-5">
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 py-3 border-b border-[var(--color-border)]">
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-medium rounded-full"
              >
                {f.label}
                <button
                  type="button"
                  onClick={() => removeFilter(f.key)}
                  className="hover:text-[var(--color-accent-dark)] ml-0.5"
                  aria-label={`Quitar filtro: ${f.label}`}
                >
                  <ClearIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <FilterSection title="Busqueda por Codigo" defaultOpen={!!code}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              <CodeIcon />
            </span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Codigo SIMI (ej: INV-001)"
              className={`${inputClass} pl-9 pr-10`}
              aria-label="Buscar por codigo SIMI"
            />
            {code && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--color-accent)] hover:text-[var(--color-accent-dark)]"
                aria-label="Buscar por codigo"
              >
                <SearchIcon />
              </button>
            )}
          </div>
        </FilterSection>

        <FilterSection title="Ubicacion">
          <div className="space-y-3">
            <LocationAutocomplete
              id="filter-location"
              value={locationQuery}
              onChange={(val) => {
                setLocationQuery(val);
              }}
              onSelect={(suggestion: LocationSuggestion) => {
                if (suggestion.type === 'ciudad') {
                  setCity(suggestion.name);
                  setLocationQuery('');
                } else if (suggestion.city) {
                  setCity(suggestion.city);
                  setLocationQuery(suggestion.name);
                }
              }}
              placeholder="Ciudad, zona o barrio"
              inputClassName={`${inputClass} pl-9`}
            />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={selectClass}
              aria-label="Filtrar por ciudad"
            >
              <option value="">Todas las ciudades</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </FilterSection>

        <FilterSection title="Tipo de Inmueble">
          <div className="space-y-2">
            {PROPERTY_TYPES.map((pt) => (
              <label
                key={pt.value}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={propertyTypes.includes(pt.value)}
                  onChange={() => togglePropertyType(pt.value)}
                  className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]/20 focus:ring-2 cursor-pointer accent-[var(--color-accent)]"
                />
                <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                  {pt.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Precio">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">$</span>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Minimo"
                  min="0"
                  className={`${inputClass} pl-6 text-xs`}
                  aria-label="Precio minimo"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">$</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Maximo"
                  min="0"
                  className={`${inputClass} pl-6 text-xs`}
                  aria-label="Precio maximo"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {priceRanges.map((r, i) => {
                const isActive =
                  minPrice === r.min.toString() &&
                  (r.max === Infinity ? !maxPrice : maxPrice === r.max.toString());
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePriceRange(r.min, r.max)}
                    className={chipClass(isActive)}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Habitaciones">
          <div className="flex flex-wrap gap-2">
            {BEDROOM_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setBedrooms(bedrooms === opt.value.toString() ? '' : opt.value.toString())}
                className={chipClass(bedrooms === opt.value.toString())}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Area (m&sup2;)">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={minArea}
              onChange={(e) => setMinArea(e.target.value)}
              placeholder="Min m&sup2;"
              min="0"
              className={`${inputClass} text-xs`}
              aria-label="Area minima"
            />
            <input
              type="number"
              value={maxArea}
              onChange={(e) => setMaxArea(e.target.value)}
              placeholder="Max m&sup2;"
              min="0"
              className={`${inputClass} text-xs`}
              aria-label="Area maxima"
            />
          </div>
        </FilterSection>

        <FilterSection title="Mas filtros" defaultOpen={!!(bathrooms || parking || stratum)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2">Baños</label>
              <div className="flex flex-wrap gap-2">
                {BATHROOM_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBathrooms(bathrooms === opt.value.toString() ? '' : opt.value.toString())}
                    className={chipClass(bathrooms === opt.value.toString())}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2">Parqueaderos</label>
              <div className="flex flex-wrap gap-2">
                {PARKING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setParking(parking === opt.value.toString() ? '' : opt.value.toString())}
                    className={chipClass(parking === opt.value.toString())}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2">Estrato</label>
              <div className="flex flex-wrap gap-2">
                {STRATUM_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStratum(stratum === opt.value.toString() ? '' : opt.value.toString())}
                    className={chipClass(stratum === opt.value.toString())}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </FilterSection>
      </div>

      <div className="shrink-0 border-t border-[var(--color-border)] p-4 lg:p-5 space-y-2 bg-white">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 h-11 bg-[var(--color-accent)] text-white font-semibold text-sm rounded-lg hover:bg-[var(--color-accent-dark)] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              <span>Buscando...</span>
            </>
          ) : (
            <>
              <SearchIcon />
              <span>Aplicar filtros</span>
            </>
          )}
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 h-10 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ClearIcon />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>
    </form>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 bg-white border-r border-[var(--color-border)] h-[calc(100vh-200px)] sticky top-28 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--color-border)]">
          <span className="text-[var(--color-accent)]">
            <FilterIcon />
          </span>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Filtros</h2>
          {hasActiveFilters && (
            <span className="ml-auto flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-[var(--color-accent)] rounded-full">
              {activeFilters.length}
            </span>
          )}
        </div>
        {sidebarContent}
      </div>

      {/* Mobile toggle + overlay */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-[var(--color-border)] rounded-xl shadow-sm transition-all duration-200 hover:border-[var(--color-accent)]/50"
          aria-expanded={mobileOpen}
          aria-controls="mobile-filter-panel"
        >
          <span className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 bg-[var(--color-accent)]/10 rounded-lg text-[var(--color-accent)]">
              <FilterIcon />
            </span>
            <span className="flex flex-col items-start">
              <span className="font-semibold text-[var(--color-text-primary)]">Filtros de busqueda</span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {hasActiveFilters
                  ? `${activeFilters.length} filtro${activeFilters.length > 1 ? 's' : ''} activo${activeFilters.length > 1 ? 's' : ''}`
                  : 'Toca para filtrar'}
              </span>
            </span>
          </span>
          <span className="flex items-center gap-2">
            {hasActiveFilters && (
              <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-[var(--color-accent)] rounded-full">
                {activeFilters.length}
              </span>
            )}
            <svg className="w-5 h-5 text-[var(--color-text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </span>
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div
              id="mobile-filter-panel"
              className="relative w-[85vw] max-w-sm bg-white h-full flex flex-col shadow-2xl animate-slide-in-left"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-accent)]">
                    <FilterIcon />
                  </span>
                  <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Filtros</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
                  aria-label="Cerrar filtros"
                >
                  <ClearIcon className="w-5 h-5" />
                </button>
              </div>
              {sidebarContent}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
