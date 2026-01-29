/**
 * LoadingSpinner
 * Simple animated spinner using brand colors
 * For general loading states across the application
 */

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'accent' | 'white' | 'navy';
  className?: string;
  label?: string;
  /** Show the label text next to the spinner */
  showLabel?: boolean;
  /** Position of the label relative to the spinner */
  labelPosition?: 'right' | 'bottom';
}

export default function LoadingSpinner({
  size = 'md',
  color = 'accent',
  className = '',
  label = 'Cargando...',
  showLabel = false,
  labelPosition = 'right',
}: Props) {
  // Size mappings
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-[3px]',
    xl: 'w-12 h-12 border-4',
  };

  // Text size mappings for visible labels
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  // Color mappings using CSS variables
  const colorClasses = {
    primary: 'border-[var(--color-primary)]/20 border-t-[var(--color-primary)]',
    accent: 'border-[var(--color-accent)]/20 border-t-[var(--color-accent)]',
    white: 'border-white/20 border-t-white',
    navy: 'border-[var(--color-navy)]/20 border-t-[var(--color-navy)]',
  };

  // Text color mappings
  const textColorClasses = {
    primary: 'text-[var(--color-primary)]',
    accent: 'text-[var(--color-accent)]',
    white: 'text-white',
    navy: 'text-[var(--color-navy)]',
  };

  const containerClasses = labelPosition === 'bottom'
    ? 'inline-flex flex-col items-center justify-center gap-2'
    : 'inline-flex items-center justify-center gap-2';

  return (
    <div
      className={`${containerClasses} ${className}`}
      role="status"
      aria-label={label}
    >
      <div
        className={`
          ${sizeClasses[size]}
          ${colorClasses[color]}
          rounded-full
          animate-spin
        `}
      />
      {showLabel ? (
        <span className={`${textSizeClasses[size]} ${textColorClasses[color]} font-medium`}>
          {label}
        </span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
}
