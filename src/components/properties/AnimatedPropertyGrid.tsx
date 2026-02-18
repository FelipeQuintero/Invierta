import { useEffect, useRef, useState } from 'react';
import type { Property } from '../../lib/types';
import PropertyCardReact from './PropertyCardReact';

interface AnimatedPropertyGridProps {
  properties: Property[];
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  staggerDelay?: number;
  gap?: number;
  showEmptyState?: boolean;
}

export default function AnimatedPropertyGrid({
  properties,
  columns = { default: 1, sm: 2, lg: 2, xl: 3 },
  staggerDelay = 100,
  gap = 1.25,
  showEmptyState = true,
}: AnimatedPropertyGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [hasAnimated, setHasAnimated] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (hasAnimated || prefersReducedMotion) {
      setVisibleItems(new Set(properties.map((_, index) => index)));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            properties.forEach((_, index) => {
              setTimeout(() => {
                setVisibleItems((prev) => new Set([...prev, index]));
              }, index * staggerDelay);
            });
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => observer.disconnect();
  }, [properties, staggerDelay, hasAnimated, prefersReducedMotion]);

  const getGridClasses = () => {
    const classes = ['grid'];
    classes.push(`grid-cols-${columns.default}`);
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    return classes.join(' ');
  };

  if (properties.length === 0 && showEmptyState) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <svg
          className="w-16 h-16 text-text-muted mb-4"
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
        <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">
          No se encontraron propiedades
        </h3>
        <p className="text-text-secondary text-sm max-w-md">
          Intenta ajustar los filtros de busqueda o explorar otras categorias para encontrar lo que buscas.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className={getGridClasses()}
      style={{ gap: `${gap}rem` }}
    >
      {properties.map((property, index) => (
        <div
          key={property.id}
          className={`stagger-item ${visibleItems.has(index) ? 'visible' : ''}`}
          style={{
            '--stagger-delay': `${index * staggerDelay}ms`,
          } as React.CSSProperties}
        >
          <PropertyCardReact
            id={property.id}
            title={property.title}
            image={property.images[0] || '/images/placeholder.jpg'}
            images={property.images}
            price={property.price}
            priceType={property.priceType}
            operationType={property.operationType}
            location={property.location}
            area={property.area}
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            parking={property.parking}
            adminFee={property.adminFee}
            tags={property.tags}
            propertyType={property.propertyType}
          />
        </div>
      ))}
    </div>
  );
}
