import { useState, useCallback, useEffect } from 'react';
import { PROPERTY_TYPES, CITIES, BEDROOM_OPTIONS } from '../../lib/constants';
import LoadingSpinner from '../ui/LoadingSpinner';

interface CurrentFilters {
  propertyType?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
}

interface Props {
  operation: string;
  currentFilters?: CurrentFilters;
  onLoadingChange?: (isLoading: boolean) => void;
}

// Icon components
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

const SearchIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const ClearIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
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

export default function PropertyFilters({ operation, currentFilters = {}, onLoadingChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [propertyType, setPropertyType] = useState(currentFilters.propertyType || '');
  const [city, setCity] = useState(currentFilters.city || '');
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice?.toString() || '');
  const [bedrooms, setBedrooms] = useState(currentFilters.bedrooms?.toString() || '');

  // Initialize from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('propertyType')) setPropertyType(params.get('propertyType') || '');
    if (params.get('city')) setCity(params.get('city') || '');
    if (params.get('minPrice')) setMinPrice(params.get('minPrice') || '');
    if (params.get('maxPrice')) setMaxPrice(params.get('maxPrice') || '');
    if (params.get('bedrooms')) setBedrooms(params.get('bedrooms') || '');
  }, []);

  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading);
    onLoadingChange?.(loading);
  }, [onLoadingChange]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoadingState(true);

    const params = new URLSearchParams();
    if (propertyType) params.set('propertyType', propertyType);
    if (city) params.set('city', city);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (bedrooms) params.set('bedrooms', bedrooms);

    const queryString = params.toString();
    const currentPath = window.location.pathname;
    window.location.href = queryString ? `${currentPath}?${queryString}` : currentPath;
  }

  function handleClear() {
    setLoadingState(true);
    setPropertyType('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    window.location.href = window.location.pathname;
  }

  const hasActiveFilters = propertyType || city || minPrice || maxPrice || bedrooms;
  const activeFilterCount = [propertyType, city, minPrice, maxPrice, bedrooms].filter(Boolean).length;

  const selectBaseClass = `
    w-full h-11 px-3
    bg-white border border-[var(--color-border)] rounded-lg
    text-sm text-[var(--color-text-primary)]
    focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20
    transition-all duration-200
    cursor-pointer
    appearance-none
    bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%234a5568%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')]
    bg-[length:12px_12px] bg-[right_12px_center] bg-no-repeat
    pr-9
  `;

  const inputBaseClass = `
    w-full h-11 px-3
    bg-white border border-[var(--color-border)] rounded-lg
    text-sm text-[var(--color-text-primary)]
    placeholder:text-[var(--color-text-muted)]
    focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20
    transition-all duration-200
  `;

  return (
    <div className="w-full">
      {/* Mobile Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full md:hidden
          flex items-center justify-between
          px-4 py-3
          bg-white border border-[var(--color-border)] rounded-xl
          shadow-sm
          transition-all duration-200
          hover:border-[var(--color-accent)]/50
        "
        aria-expanded={isOpen}
        aria-controls="filter-panel"
      >
        <span className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 bg-[var(--color-accent)]/10 rounded-lg text-[var(--color-accent)]">
            <FilterIcon />
          </span>
          <span className="flex flex-col items-start">
            <span className="font-semibold text-[var(--color-text-primary)]">Filtros de busqueda</span>
            <span className="text-xs text-[var(--color-text-muted)]">
              {hasActiveFilters ? `${activeFilterCount} filtro${activeFilterCount > 1 ? 's' : ''} activo${activeFilterCount > 1 ? 's' : ''}` : 'Toca para filtrar'}
            </span>
          </span>
        </span>
        <span className="flex items-center gap-2">
          {hasActiveFilters && (
            <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-[var(--color-accent)] rounded-full">
              {activeFilterCount}
            </span>
          )}
          <ChevronIcon isOpen={isOpen} />
        </span>
      </button>

      {/* Filter Form */}
      <form
        id="filter-panel"
        onSubmit={handleSubmit}
        className={`
          ${isOpen ? 'max-h-[600px] opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}
          md:max-h-none md:opacity-100 md:mt-0
          overflow-hidden
          transition-all duration-300 ease-in-out
        `}
      >
        <div className="
          bg-white border border-[var(--color-border)] rounded-xl
          p-4 md:p-5
          shadow-sm
        ">
          {/* Desktop: Horizontal layout */}
          <div className="hidden md:flex md:flex-wrap md:items-end md:gap-3">
            {/* Property Type */}
            <div className="flex-1 min-w-[160px]">
              <label htmlFor="filter-propertyType" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
                Tipo de inmueble
              </label>
              <select
                id="filter-propertyType"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className={selectBaseClass}
              >
                <option value="">Todos los tipos</option>
                {PROPERTY_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div className="flex-1 min-w-[160px]">
              <label htmlFor="filter-city" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
                Ciudad
              </label>
              <select
                id="filter-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={selectBaseClass}
              >
                <option value="">Todas las ciudades</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div className="flex-1 min-w-[140px]">
              <label htmlFor="filter-minPrice" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
                Precio minimo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
                <input
                  id="filter-minPrice"
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder={operation === 'arriendo' ? '500.000' : '100.000.000'}
                  min="0"
                  className={`${inputBaseClass} pl-7`}
                />
              </div>
            </div>

            {/* Max Price */}
            <div className="flex-1 min-w-[140px]">
              <label htmlFor="filter-maxPrice" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
                Precio maximo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
                <input
                  id="filter-maxPrice"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder={operation === 'arriendo' ? '10.000.000' : '2.000.000.000'}
                  min="0"
                  className={`${inputBaseClass} pl-7`}
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div className="flex-1 min-w-[120px]">
              <label htmlFor="filter-bedrooms" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
                Habitaciones
              </label>
              <select
                id="filter-bedrooms"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className={selectBaseClass}
              >
                <option value="">Todas</option>
                {BEDROOM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}+</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="
                  inline-flex items-center justify-center gap-2
                  h-11 px-6
                  bg-[var(--color-accent)] text-white
                  font-semibold text-sm
                  rounded-lg
                  hover:bg-[var(--color-accent-dark)]
                  active:scale-[0.98]
                  transition-all duration-200
                  disabled:opacity-70 disabled:cursor-not-allowed
                  shadow-sm hover:shadow-md
                "
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <SearchIcon />
                    <span>Buscar</span>
                  </>
                )}
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isLoading}
                  className="
                    inline-flex items-center justify-center
                    h-11 w-11
                    bg-[var(--color-surface)] text-[var(--color-text-secondary)]
                    rounded-lg border border-[var(--color-border)]
                    hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]
                    active:scale-[0.98]
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  title="Limpiar filtros"
                  aria-label="Limpiar filtros"
                >
                  <ClearIcon />
                </button>
              )}
            </div>
          </div>

          {/* Mobile: Grid layout */}
          <div className="md:hidden space-y-4">
            {/* Property Type */}
            <div>
              <label htmlFor="filter-propertyType-mobile" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
                Tipo de inmueble
              </label>
              <select
                id="filter-propertyType-mobile"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className={selectBaseClass}
              >
                <option value="">Todos los tipos</option>
                {PROPERTY_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label htmlFor="filter-city-mobile" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
                Ciudad
              </label>
              <select
                id="filter-city-mobile"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={selectBaseClass}
              >
                <option value="">Todas las ciudades</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Price Range - 2 columns */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="filter-minPrice-mobile" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
                  Precio min.
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
                  <input
                    id="filter-minPrice-mobile"
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder={operation === 'arriendo' ? '500K' : '100M'}
                    min="0"
                    className={`${inputBaseClass} pl-7`}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="filter-maxPrice-mobile" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
                  Precio max.
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
                  <input
                    id="filter-maxPrice-mobile"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder={operation === 'arriendo' ? '10M' : '2.000M'}
                    min="0"
                    className={`${inputBaseClass} pl-7`}
                  />
                </div>
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label htmlFor="filter-bedrooms-mobile" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
                Habitaciones
              </label>
              <select
                id="filter-bedrooms-mobile"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className={selectBaseClass}
              >
                <option value="">Todas</option>
                {BEDROOM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}+ habitaciones</option>
                ))}
              </select>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="
                  flex-1
                  inline-flex items-center justify-center gap-2
                  h-12 px-6
                  bg-[var(--color-accent)] text-white
                  font-semibold text-sm
                  rounded-lg
                  hover:bg-[var(--color-accent-dark)]
                  active:scale-[0.98]
                  transition-all duration-200
                  disabled:opacity-70 disabled:cursor-not-allowed
                  shadow-sm
                "
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <SearchIcon />
                    <span>Buscar propiedades</span>
                  </>
                )}
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isLoading}
                  className="
                    inline-flex items-center justify-center
                    h-12 w-12
                    bg-[var(--color-surface)] text-[var(--color-text-secondary)]
                    rounded-lg border border-[var(--color-border)]
                    hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]
                    active:scale-[0.98]
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  title="Limpiar filtros"
                  aria-label="Limpiar filtros"
                >
                  <ClearIcon />
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Tags (optional display) */}
          {hasActiveFilters && (
            <div className="hidden md:flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
              <span className="text-xs text-[var(--color-text-muted)] py-1">Filtros activos:</span>
              {propertyType && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-medium rounded-full">
                  {PROPERTY_TYPES.find(p => p.value === propertyType)?.label || propertyType}
                  <button
                    type="button"
                    onClick={() => setPropertyType('')}
                    className="hover:text-[var(--color-accent-dark)]"
                    aria-label="Quitar filtro de tipo"
                  >
                    <ClearIcon />
                  </button>
                </span>
              )}
              {city && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-medium rounded-full">
                  {city}
                  <button
                    type="button"
                    onClick={() => setCity('')}
                    className="hover:text-[var(--color-accent-dark)]"
                    aria-label="Quitar filtro de ciudad"
                  >
                    <ClearIcon />
                  </button>
                </span>
              )}
              {minPrice && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-medium rounded-full">
                  Min: ${Number(minPrice).toLocaleString('es-CO')}
                  <button
                    type="button"
                    onClick={() => setMinPrice('')}
                    className="hover:text-[var(--color-accent-dark)]"
                    aria-label="Quitar filtro de precio minimo"
                  >
                    <ClearIcon />
                  </button>
                </span>
              )}
              {maxPrice && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-medium rounded-full">
                  Max: ${Number(maxPrice).toLocaleString('es-CO')}
                  <button
                    type="button"
                    onClick={() => setMaxPrice('')}
                    className="hover:text-[var(--color-accent-dark)]"
                    aria-label="Quitar filtro de precio maximo"
                  >
                    <ClearIcon />
                  </button>
                </span>
              )}
              {bedrooms && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-medium rounded-full">
                  {bedrooms}+ hab.
                  <button
                    type="button"
                    onClick={() => setBedrooms('')}
                    className="hover:text-[var(--color-accent-dark)]"
                    aria-label="Quitar filtro de habitaciones"
                  >
                    <ClearIcon />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
