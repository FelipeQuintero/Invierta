import type { ReactNode, CSSProperties } from 'react';
import { useScrollAnimation } from '../../lib/useScrollAnimation';

export type AnimationType =
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'zoom-out';

interface AnimateOnScrollProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
}

/**
 * Wrapper component that animates children when they enter the viewport.
 * Uses Intersection Observer for performance and respects reduced motion preferences.
 *
 * @param children - Content to animate
 * @param animation - Type of animation to apply
 * @param delay - Delay in milliseconds before animation starts
 * @param duration - Duration of animation in milliseconds
 * @param threshold - Percentage of element visibility needed to trigger (0-1)
 * @param className - Additional CSS classes
 */
export function AnimateOnScroll({
  children,
  animation = 'fade',
  delay = 0,
  duration = 600,
  threshold = 0.1,
  className = '',
}: AnimateOnScrollProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold });

  const animationClass = `animate-${animation}`;
  const visibleClass = isVisible ? 'visible' : '';

  const style: CSSProperties = {
    '--animation-delay': `${delay}ms`,
    '--animation-duration': `${duration}ms`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${animationClass} ${visibleClass} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}

export default AnimateOnScroll;
