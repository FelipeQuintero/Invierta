interface Props {
  className?: string;
  animationDelay?: number;
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
      className={`block bg-white rounded-xl overflow-hidden shadow-md ${className}`}
      aria-hidden="true"
      role="presentation"
      style={delayStyle}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-surface-alt)]">
        <div className="skeleton skeleton-shimmer absolute inset-0" />

        {variant === 'default' && (
          <>
            <div className="absolute top-3 left-3">
              <div className="skeleton skeleton-shimmer h-6 w-20 rounded-md bg-[var(--color-surface)]" />
            </div>
            <div className="absolute top-3 right-3">
              <div className="skeleton skeleton-shimmer h-8 w-8 rounded-full bg-[var(--color-surface)]" />
            </div>
          </>
        )}
      </div>

      <div className="p-4">
        <div className="mb-1">
          <div className="skeleton skeleton-shimmer h-6 w-40 rounded mb-1" />
        </div>

        <div className="skeleton skeleton-shimmer h-4 w-[75%] rounded mb-1.5" />

        <div className="flex items-center gap-1.5 mb-2">
          <div className="skeleton skeleton-shimmer h-3.5 w-3.5 rounded flex-shrink-0" />
          <div className="skeleton skeleton-shimmer h-3.5 w-[45%] rounded" />
        </div>

        <div className="skeleton skeleton-shimmer h-4 w-16 rounded mb-3" />

        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-1">
            <div className="skeleton skeleton-shimmer h-3.5 w-3.5 rounded" />
            <div className="skeleton skeleton-shimmer h-3.5 w-12 rounded" />
          </div>
          <div className="flex items-center gap-1">
            <div className="skeleton skeleton-shimmer h-3.5 w-3.5 rounded" />
            <div className="skeleton skeleton-shimmer h-3.5 w-4 rounded" />
          </div>
          <div className="flex items-center gap-1">
            <div className="skeleton skeleton-shimmer h-3.5 w-3.5 rounded" />
            <div className="skeleton skeleton-shimmer h-3.5 w-4 rounded" />
          </div>
          <div className="flex items-center gap-1">
            <div className="skeleton skeleton-shimmer h-3.5 w-3.5 rounded" />
            <div className="skeleton skeleton-shimmer h-3.5 w-4 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
