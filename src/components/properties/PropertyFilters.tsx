import { useState } from 'react';
import { PROPERTY_TYPES, CITIES, BEDROOM_OPTIONS } from '../../lib/constants';

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
}

export default function PropertyFilters({ operation, currentFilters = {} }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [propertyType, setPropertyType] = useState(currentFilters.propertyType || '');
  const [city, setCity] = useState(currentFilters.city || '');
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice?.toString() || '');
  const [bedrooms, setBedrooms] = useState(currentFilters.bedrooms?.toString() || '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    setPropertyType('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    window.location.href = window.location.pathname;
  }

  const hasActiveFilters = propertyType || city || minPrice || maxPrice || bedrooms;

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl shadow-sm">
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 md:hidden"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 font-semibold text-[var(--color-text-primary)]">
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filtros
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[var(--color-secondary)] rounded-full">
              !
            </span>
          )}
        </span>
        <svg
          className={`w-5 h-5 text-[var(--color-text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Filter form */}
      <form
        onSubmit={handleSubmit}
        className={`${isOpen ? 'block' : 'hidden'} md:block p-4 md:p-5`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Property Type */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="filter-propertyType"
              className="text-sm font-medium text-[var(--color-text-secondary)]"
            >
              Tipo de inmueble
            </label>
            <select
              id="filter-propertyType"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none transition-colors"
            >
              <option value="">Todos</option>
              {PROPERTY_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="filter-city"
              className="text-sm font-medium text-[var(--color-text-secondary)]"
            >
              Ciudad
            </label>
            <select
              id="filter-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none transition-colors"
            >
              <option value="">Todas</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Min Price */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="filter-minPrice"
              className="text-sm font-medium text-[var(--color-text-secondary)]"
            >
              Precio min.
            </label>
            <input
              id="filter-minPrice"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder={operation === 'arriendo' ? '500.000' : '100.000.000'}
              min="0"
              className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none transition-colors"
            />
          </div>

          {/* Max Price */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="filter-maxPrice"
              className="text-sm font-medium text-[var(--color-text-secondary)]"
            >
              Precio max.
            </label>
            <input
              id="filter-maxPrice"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder={operation === 'arriendo' ? '10.000.000' : '2.000.000.000'}
              min="0"
              className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none transition-colors"
            />
          </div>

          {/* Bedrooms */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="filter-bedrooms"
              className="text-sm font-medium text-[var(--color-text-secondary)]"
            >
              Habitaciones
            </label>
            <select
              id="filter-bedrooms"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none transition-colors"
            >
              <option value="">Todas</option>
              {BEDROOM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-transparent select-none hidden xl:block" aria-hidden="true">
              &nbsp;
            </span>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--color-primary-light)] active:bg-[var(--color-primary-dark)] transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                Buscar
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center justify-center px-3 py-2.5 bg-transparent text-[var(--color-text-secondary)] text-sm font-medium rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                  title="Limpiar filtros"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
