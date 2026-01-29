/**
 * PropertyCardSkeleton
 * Loading skeleton that mirrors the structure of PropertyCard.astro
 * Shows shimmer animation while properties are loading
 */

interface Props {
  className?: string;
  /** Animation delay for staggered effect (in ms) */
  animationDelay?: number;
  /** Variant of the skeleton - 'default' shows all elements, 'compact' is simpler */
  variant?: 'default' | 'compact';
}

export default function PropertyCardSkeleton({
  className = '',
  animationDelay = 0,
  variant = 'default',
}: Props) {
  const delayStyle = animationDelay > 0 ? { animationDelay: `${animationDelay}ms` } : undefined;

  return (
    <div
      className={`block bg-white rounded-xl overflow-hidden border border-[var(--color-border)] shadow-sm ${className}`}
      aria-hidden="true"
      role="presentation"
      style={delayStyle}
    >
      {/* Image skeleton with shimmer */}
      <div className="relative aspect-video overflow-hidden bg-[var(--color-surface-alt)]">
        <div className="skeleton skeleton-shimmer absolute inset-0" />

        {/* Tag badge placeholder - top left */}
        {variant === 'default' && (
          <div className="absolute top-3 left-3 flex gap-1.5">
            <div className="skeleton skeleton-shimmer h-6 w-16 rounded-full bg-[var(--color-surface)]" />
          </div>
        )}

        {/* Price overlay placeholder - bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent pt-8 pb-3 px-4">
          <div className="skeleton skeleton-shimmer h-6 w-36 rounded bg-white/20" />
        </div>
      </div>

      {/* Info section skeleton */}
      <div className="p-4">
        {/* Title skeleton - 2 lines */}
        <div className="space-y-2 mb-2">
          <div className="skeleton skeleton-shimmer h-5 w-[85%] rounded" />
          <div className="skeleton skeleton-shimmer h-5 w-[55%] rounded" />
        </div>

        {/* Location skeleton */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="skeleton skeleton-shimmer h-4 w-4 rounded flex-shrink-0" />
          <div className="skeleton skeleton-shimmer h-4 w-[45%] rounded" />
        </div>

        {/* Property type badge skeleton */}
        <div className="skeleton skeleton-shimmer h-5 w-20 rounded-md mb-3" />

        {/* Bottom row: area, bedrooms, bathrooms */}
        <div className="flex items-center gap-4 pt-3 border-t border-[var(--color-border)]">
          {/* Area */}
          <div className="flex items-center gap-1.5">
            <div className="skeleton skeleton-shimmer h-4 w-4 rounded" />
            <div className="skeleton skeleton-shimmer h-4 w-14 rounded" />
          </div>

          {/* Bedrooms */}
          <div className="flex items-center gap-1.5">
            <div className="skeleton skeleton-shimmer h-4 w-4 rounded" />
            <div className="skeleton skeleton-shimmer h-4 w-5 rounded" />
          </div>

          {/* Bathrooms */}
          <div className="flex items-center gap-1.5">
            <div className="skeleton skeleton-shimmer h-4 w-4 rounded" />
            <div className="skeleton skeleton-shimmer h-4 w-5 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
