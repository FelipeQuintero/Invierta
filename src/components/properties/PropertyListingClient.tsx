/**
 * PropertyListingClient
 * A fully client-side property listing component with integrated loading states.
 * Shows PropertyGridSkeleton while fetching, then displays results.
 * Uses the /api/propiedades endpoint for data fetching.
 */

import { useState, useEffect, useCallback } from 'react';
import PropertyCardReact from './PropertyCardReact';
import PropertyGridSkeleton from '../ui/PropertyGridSkeleton';
import LoadingSpinner from '../ui/LoadingSpinner';
import type { Property } from '../../lib/types';

interface Filters {
  operation?: string;
  propertyType?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  query?: string;
  limit?: number;
  offset?: number;
  featured?: boolean;
}

interface Props {
  /** Initial filters to apply */
  initialFilters?: Filters;
  /** Number of items per page */
  pageSize?: number;
  /** Number of columns for the grid */
  columns?: 2 | 3 | 4;
  /** Initial properties (for SSR hydration) */
  initialProperties?: Property[];
  /** Show the "load more" button */
  showLoadMore?: boolean;
  /** Class name for the container */
  className?: string;
}

export default function PropertyListingClient({
  initialFilters = {},
  pageSize = 12,
  columns = 3,
  initialProperties,
  showLoadMore = true,
  className = '',
}: Props) {
  const [properties, setProperties] = useState<Property[]>(initialProperties || []);
  const [isLoading, setIsLoading] = useState(!initialProperties);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(initialProperties?.length || 0);

  // Fetch properties from API
  const fetchProperties = useCallback(async (filters: Filters, append = false) => {
    try {
      const params = new URLSearchParams();

      if (filters.operation) params.set('operation', filters.operation);
      if (filters.propertyType) params.set('propertyType', filters.propertyType);
      if (filters.city) params.set('city', filters.city);
      if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
      if (filters.bedrooms) params.set('bedrooms', filters.bedrooms.toString());
      if (filters.query) params.set('query', filters.query);
      if (filters.featured) params.set('featured', 'true');
      if (filters.limit) params.set('limit', filters.limit.toString());
      if (filters.offset) params.set('offset', filters.offset.toString());

      const response = await fetch(`/api/propiedades?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Error al cargar las propiedades');
      }

      const result = await response.json();
      const newProperties: Property[] = result.data || [];

      if (append) {
        setProperties(prev => [...prev, ...newProperties]);
      } else {
        setProperties(newProperties);
      }

      // Check if there are more properties to load
      setHasMore(newProperties.length >= (filters.limit || pageSize));
      setOffset(prev => append ? prev + newProperties.length : newProperties.length);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      if (!append) {
        setProperties([]);
      }
    }
  }, [pageSize]);

  // Initial fetch (only if no initial properties provided)
  useEffect(() => {
    if (!initialProperties) {
      setIsLoading(true);
      fetchProperties({ ...initialFilters, limit: pageSize }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [initialFilters, pageSize, fetchProperties, initialProperties]);

  // Load more handler
  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await fetchProperties({
      ...initialFilters,
      limit: pageSize,
      offset,
    }, true);
    setIsLoadingMore(false);
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className={className}>
        <PropertyGridSkeleton count={pageSize} columns={columns} stagger />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
        <svg
          className="w-16 h-16 text-[var(--color-error)] mb-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6" />
          <path d="m9 9 6 6" />
        </svg>
        <h3 className="font-heading text-lg font-semibold text-[var(--color-text-primary)] mb-2">
          Error al cargar propiedades
        </h3>
        <p className="text-[var(--color-text-secondary)] text-sm max-w-md mb-4">
          {error}
        </p>
        <button
          onClick={() => {
            setIsLoading(true);
            setError(null);
            fetchProperties({ ...initialFilters, limit: pageSize }).finally(() => {
              setIsLoading(false);
            });
          }}
          className="btn-primary"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Render empty state
  if (properties.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
        <svg
          className="w-16 h-16 text-[var(--color-text-muted)] mb-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
          <path d="M8 11h6" />
        </svg>
        <h3 className="font-heading text-lg font-semibold text-[var(--color-text-primary)] mb-2">
          No se encontraron propiedades
        </h3>
        <p className="text-[var(--color-text-secondary)] text-sm max-w-md">
          Intenta ajustar los filtros de busqueda o explorar otras categorias para encontrar lo que buscas.
        </p>
      </div>
    );
  }

  // Map columns to grid classes
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={className}>
      {/* Property grid */}
      <div className={`grid ${columnClasses[columns]} gap-6`}>
        {properties.map((property, index) => (
          <PropertyCardReact
            key={property.id}
            id={property.id}
            title={property.title}
            image={property.images[0] || '/images/placeholder.jpg'}
            price={property.price}
            priceType={property.priceType}
            location={property.location}
            area={property.area}
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            tags={property.tags}
            propertyType={property.propertyType}
            className="stagger-item visible"
            style={{ '--stagger-delay': `${index * 50}ms` } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Load more button */}
      {showLoadMore && hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="btn-outline inline-flex items-center gap-2 disabled:opacity-70"
          >
            {isLoadingMore ? (
              <>
                <LoadingSpinner size="sm" color="accent" />
                <span>Cargando...</span>
              </>
            ) : (
              <span>Cargar mas propiedades</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
