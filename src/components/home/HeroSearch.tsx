import { useState, useCallback, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { OPERATION_TYPES, PROPERTY_TYPES } from '../../lib/constants';
import type { OperationType, PropertyType } from '../../lib/types';
import PropertyTypeIcon from '../ui/PropertyTypeIcon';
import LocationAutocomplete from '../ui/LocationAutocomplete';
import type { LocationSuggestion } from '../../lib/locationSearch';

export default function HeroSearch() {
  const [operation, setOperation] = useState<OperationType>('venta');
  const [propertyType, setPropertyType] = useState('');
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [searchMode, setSearchMode] = useState<'location' | 'code'>('location');

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setTypeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedLocation(null);
  }, []);

  const handleLocationSelect = useCallback((suggestion: LocationSuggestion) => {
    setSelectedLocation(suggestion);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedQuery = query.trim();

    if (searchMode === 'code') {
      if (trimmedQuery) {
        window.location.href = `/propiedades?code=${encodeURIComponent(trimmedQuery)}`;
      }
      return;
    }

    const basePath = operation === 'proyecto' ? '/proyectos' : '/propiedades';
    const params = new URLSearchParams();

    if (operation) params.set('operation', operation);
    if (propertyType) params.set('type', propertyType);

    if (trimmedQuery) {
      if (selectedLocation) {
        if (selectedLocation.type === 'ciudad') {
          params.set('city', selectedLocation.name);
        } else if (selectedLocation.city) {
          params.set('city', selectedLocation.city);
          params.set('locationQuery', selectedLocation.name);
        } else {
          params.set('city', trimmedQuery);
        }
      } else {
        params.set('city', trimmedQuery);
      }
    }

    const queryString = params.toString();
    window.location.href = queryString ? `${basePath}?${queryString}` : basePath;
  }

  const inputClass = "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow";

  return (
    <section className="relative w-full min-h-[540px] md:min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600)',
        }}
      />
      {/* Gradient overlay - azul oscuro a naranja */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332]/90 via-[#1a2332]/75 to-[#f97316]/60" />

      {/* Content */}
      <div className="relative z-10 w-full container-custom py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center mb-10 md:mb-12">
          <h1 className="font-[family-name:var(--font-family-heading)] text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-tight mb-4">
            Encuentra tu proximo hogar
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-light max-w-xl mx-auto">
            Miles de propiedades en venta y arriendo en las mejores zonas de Colombia
          </p>
        </div>

        {/* Search form card */}
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-2xl p-4 md:p-6"
          >
            {/* Radio toggle */}
            <div className="flex items-center gap-5 mb-4 pl-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="searchMode"
                  checked={searchMode === 'location'}
                  onChange={() => { setSearchMode('location'); setQuery(''); setSelectedLocation(null); }}
                  className="w-4 h-4 accent-[var(--color-primary)]"
                />
                <span className={`text-sm font-medium ${searchMode === 'location' ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                  Ubicacion
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="searchMode"
                  checked={searchMode === 'code'}
                  onChange={() => { setSearchMode('code'); setQuery(''); setSelectedLocation(null); }}
                  className="w-4 h-4 accent-[var(--color-primary)]"
                />
                <span className={`text-sm font-medium ${searchMode === 'code' ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                  Codigo
                </span>
              </label>
            </div>

            {searchMode === 'location' ? (
              /* Location mode: operation + type + location + button */
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
                <div className="flex flex-col">
                  <label
                    htmlFor="hero-operation"
                    className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-1.5 pl-1"
                  >
                    Tipo de operacion
                  </label>
                  <select
                    id="hero-operation"
                    value={operation}
                    onChange={(e) => setOperation(e.target.value as OperationType)}
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                    {OPERATION_TYPES.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col relative" ref={typeDropdownRef}>
                  <span
                    className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-1.5 pl-1"
                  >
                    Tipo de inmueble
                  </span>
                  <button
                    type="button"
                    onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                    className={`${inputClass} appearance-none cursor-pointer text-left flex items-center justify-between gap-2`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {propertyType ? (
                        <>
                          <PropertyTypeIcon type={propertyType as PropertyType} className="w-4 h-4 shrink-0 text-[var(--color-accent)]" />
                          <span>{PROPERTY_TYPES.find(pt => pt.value === propertyType)?.label}</span>
                        </>
                      ) : (
                        <span>Todos</span>
                      )}
                    </span>
                    <svg className={`w-4 h-4 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 ${typeDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </button>
                  {typeDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-[var(--color-border)] z-50 p-3 min-w-[280px] md:min-w-[320px]">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-sm font-semibold text-[var(--color-text-primary)]">Tipo de inmueble</span>
                        <button
                          type="button"
                          onClick={() => setTypeDropdownOpen(false)}
                          className="p-1 hover:bg-[var(--color-surface)] rounded-md transition-colors"
                          aria-label="Cerrar"
                        >
                          <svg className="w-4 h-4 text-[var(--color-text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {PROPERTY_TYPES.map((pt) => {
                          const isActive = propertyType === pt.value;
                          return (
                            <button
                              key={pt.value}
                              type="button"
                              onClick={() => {
                                setPropertyType(isActive ? '' : pt.value);
                                if (!isActive) setTypeDropdownOpen(false);
                              }}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-full border transition-all duration-150 cursor-pointer ${
                                isActive
                                  ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-sm'
                                  : 'bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)]/50 hover:text-[var(--color-text-primary)]'
                              }`}
                            >
                              <PropertyTypeIcon type={pt.value as PropertyType} className="w-3.5 h-3.5" />
                              <span>{pt.label}</span>
                              {isActive && (
                                <svg className="w-3 h-3 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <LocationAutocomplete
                  id="hero-query"
                  label="Ubicacion"
                  value={query}
                  onChange={handleLocationChange}
                  onSelect={handleLocationSelect}
                  placeholder="Ej: Bogota, Chapinero..."
                  inputClassName={inputClass}
                  className="flex flex-col"
                />

                <div className="flex flex-col justify-end">
                  <button
                    type="submit"
                    className="btn-primary w-full py-3 text-sm md:text-base rounded-lg"
                  >
                    <Search className="w-5 h-5" />
                    <span>Buscar</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Code mode: just code input + button */
              <div className="flex gap-3 md:gap-4">
                <div className="relative flex-1">
                  <input
                    id="hero-code"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Codigo del inmueble"
                    className={`${inputClass} pr-10`}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                </div>
                <button
                  type="submit"
                  className="btn-primary px-6 py-3 text-sm md:text-base rounded-lg shrink-0"
                >
                  <span>Buscar</span>
                </button>
              </div>
            )}
          </form>

          {/* Quick links below search */}
          <div className="flex flex-wrap justify-center gap-3 mt-5">
            <span className="text-white/60 text-sm">Populares:</span>
            {['Apartamentos en Bogota', 'Casas en Medellin', 'Arriendos en Cali'].map(
              (term) => (
                <a
                  key={term}
                  href={`/propiedades?city=${encodeURIComponent(term.split(' en ')[1] || '')}`}
                  className="text-sm text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-full px-3 py-1 transition-colors"
                >
                  {term}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
