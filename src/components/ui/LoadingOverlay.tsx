/**
 * LoadingOverlay
 * A semi-transparent overlay with a centered spinner.
 * Use to indicate loading state over existing content.
 */

import LoadingSpinner from './LoadingSpinner';

interface Props {
  /** Whether the overlay is visible */
  isVisible: boolean;
  /** Loading message to display */
  message?: string;
  /** Background opacity (0-100) */
  opacity?: number;
  /** Spinner size */
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl';
  /** Spinner color */
  spinnerColor?: 'primary' | 'accent' | 'white' | 'navy';
  /** Additional CSS classes for the overlay */
  className?: string;
  /** Whether to blur the background */
  blur?: boolean;
}

export default function LoadingOverlay({
  isVisible,
  message = 'Cargando...',
  opacity = 80,
  spinnerSize = 'lg',
  spinnerColor = 'accent',
  className = '',
  blur = true,
}: Props) {
  if (!isVisible) return null;

  return (
    <div
      className={`
        absolute inset-0 z-50 flex flex-col items-center justify-center
        ${blur ? 'backdrop-blur-sm' : ''}
        ${className}
      `}
      style={{ backgroundColor: `rgba(255, 255, 255, ${opacity / 100})` }}
      role="alert"
      aria-busy="true"
      aria-live="polite"
    >
      <LoadingSpinner
        size={spinnerSize}
        color={spinnerColor}
        showLabel
        labelPosition="bottom"
        label={message}
      />
    </div>
  );
}
