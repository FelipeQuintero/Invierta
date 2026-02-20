import { useState } from 'react';
import type { Property } from '../../lib/types';
import AnimatedPropertyGrid from './AnimatedPropertyGrid';
import PropertiesMap from './PropertiesMap';
import DidYouMean from '../ui/DidYouMean';

type ViewMode = 'list' | 'map';

interface PropertyListingContentProps {
  properties: Property[];
  hasActiveFilters: boolean;
  emptyHref: string;
  emptyLabel: string;
  itemLabel?: string;
  sortOptions: { value: string; label: string }[];
  locationQuery?: string;
}

export default function PropertyListingContent({
  properties,
  hasActiveFilters,
  emptyHref,
  emptyLabel,
  itemLabel = 'propiedades',
  sortOptions,
  locationQuery,
}: PropertyListingContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [visibleCount, setVisibleCount] = useState(12);

  return (
    <div className="flex-1 min-w-0 mt-6 lg:mt-0">
      {/* Top bar: count, sort, view toggle */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          {hasActiveFilters ? (
            <>
              <span className="font-semibold text-text-primary">{properties.length}</span>{' '}
              resultado{properties.length !== 1 ? 's' : ''} encontrado{properties.length !== 1 ? 's' : ''}
            </>
          ) : (
            <>
              Mostrando <span className="font-semibold text-text-primary">{properties.length}</span> {itemLabel}
            </>
          )}
        </p>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-accent text-white'
                  : 'bg-white text-text-secondary hover:bg-surface'
              }`}
              aria-label="Vista de lista"
              title="Vista de lista"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              <span className="hidden sm:inline">Lista</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-accent text-white'
                  : 'bg-white text-text-secondary hover:bg-surface'
              }`}
              aria-label="Vista de mapa"
              title="Vista de mapa"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="hidden sm:inline">Mapa</span>
            </button>
          </div>

          {/* Sort dropdown - only visible in list mode */}
          {viewMode === 'list' && (
            <div className="flex items-center gap-3">
              <label htmlFor="sort-select" className="text-sm text-text-secondary whitespace-nowrap hidden sm:inline">
                Ordenar por:
              </label>
              <select
                id="sort-select"
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      {properties.length > 0 ? (
        viewMode === 'list' ? (
          <>
            <AnimatedPropertyGrid
              properties={properties.slice(0, visibleCount)}
              columns={{ default: 1, sm: 2, lg: 2, xl: 3 }}
              staggerDelay={80}
              gap={1.25}
            />
            {visibleCount < properties.length && (
              <div className="mt-10 flex justify-center">
                <button className="btn-outline" onClick={() => setVisibleCount(prev => prev + 12)}>
                  Cargar mas {itemLabel}
                </button>
              </div>
            )}
          </>
        ) : (
          <PropertiesMap properties={properties} />
        )
      ) : (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface">
            <svg className="h-8 w-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No se encontraron {itemLabel}
          </h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            No hay {itemLabel} que coincidan con los filtros seleccionados. Intenta ajustar los criterios de busqueda.
          </p>
          {locationQuery && (
            <DidYouMean query={locationQuery} basePath={emptyHref} />
          )}
          <a href={emptyHref} className="btn-primary inline-flex mt-4">
            {emptyLabel}
          </a>
        </div>
      )}
    </div>
  );
}
