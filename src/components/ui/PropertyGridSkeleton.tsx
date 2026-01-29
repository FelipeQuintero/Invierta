/**
 * PropertyGridSkeleton
 * Grid of PropertyCardSkeletons for loading states
 * Mirrors the grid layout used in property listings
 */

import PropertyCardSkeleton from './PropertyCardSkeleton';

interface Props {
  /** Number of skeleton cards to display */
  count?: number;
  /** Number of columns in the grid */
  columns?: 2 | 3 | 4;
  /** Additional CSS classes */
  className?: string;
  /** Enable staggered animation (each card animates slightly after the previous) */
  stagger?: boolean;
  /** Base delay for stagger animation in ms */
  staggerDelay?: number;
  /** Skeleton variant */
  variant?: 'default' | 'compact';
}

export default function PropertyGridSkeleton({
  count = 6,
  columns = 3,
  className = '',
  stagger = true,
  staggerDelay = 75,
  variant = 'default',
}: Props) {
  // Map columns to Tailwind grid classes
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div
      className={`grid ${columnClasses[columns]} gap-6 ${className}`}
      role="status"
      aria-label="Cargando propiedades"
    >
      {Array.from({ length: count }).map((_, index) => (
        <PropertyCardSkeleton
          key={index}
          animationDelay={stagger ? index * staggerDelay : 0}
          variant={variant}
        />
      ))}
      <span className="sr-only">Cargando propiedades...</span>
    </div>
  );
}
