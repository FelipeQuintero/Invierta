import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { OPERATION_TYPES, PROPERTY_TYPES } from '../../lib/constants';
import type { OperationType } from '../../lib/types';
import LocationAutocomplete from '../ui/LocationAutocomplete';
import type { LocationSuggestion } from '../../lib/locationSearch';

export default function HeroSearch() {
  const [operation, setOperation] = useState<OperationType>('venta');
  const [propertyType, setPropertyType] = useState('');
  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);

  const handleLocationChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedLocation(null);
  }, []);

  const handleLocationSelect = useCallback((suggestion: LocationSuggestion) => {
    setSelectedLocation(suggestion);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const routeMap: Record<string, string> = {
      venta: '/ventas',
      arriendo: '/arriendos',
      proyecto: '/proyectos',
    };

    const basePath = routeMap[operation] || '/ventas';
    const params = new URLSearchParams();

    if (operation) params.set('operation', operation);
    if (propertyType) params.set('type', propertyType);

    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      // Detect SIMI codes (e.g. "188-2470", "INV-001")
      const isCode = /^\d{1,4}-\d+$/.test(trimmedQuery) || /^[A-Za-z]{2,5}-\d+$/.test(trimmedQuery);
      if (isCode) {
        params.set('code', trimmedQuery);
      } else if (selectedLocation) {
        // Use the selected location's city for filtering
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
              {/* Tipo de operacion */}
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
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow appearance-none cursor-pointer"
                >
                  {OPERATION_TYPES.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de inmueble */}
              <div className="flex flex-col">
                <label
                  htmlFor="hero-property-type"
                  className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-1.5 pl-1"
                >
                  Tipo de inmueble
                </label>
                <select
                  id="hero-property-type"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow appearance-none cursor-pointer"
                >
                  <option value="">Todos</option>
                  {PROPERTY_TYPES.map((pt) => (
                    <option key={pt.value} value={pt.value}>
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ciudad, zona o codigo */}
              <LocationAutocomplete
                id="hero-query"
                label="Ciudad o codigo"
                value={query}
                onChange={handleLocationChange}
                onSelect={handleLocationSelect}
                placeholder="Ej: Bogota, Chapinero..."
                inputClassName="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                className="flex flex-col"
              />

              {/* Submit button */}
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
          </form>

          {/* Quick links below search */}
          <div className="flex flex-wrap justify-center gap-3 mt-5">
            <span className="text-white/60 text-sm">Populares:</span>
            {['Apartamentos en Bogota', 'Casas en Medellin', 'Arriendos en Cali'].map(
              (term) => (
                <a
                  key={term}
                  href={`/ventas?city=${encodeURIComponent(term.split(' en ')[1] || '')}`}
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
