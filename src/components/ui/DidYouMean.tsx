import { useState, useEffect } from 'react';
import { getDidYouMean } from '../../lib/locationSearch';

interface Props {
  query: string;
  basePath: string;
}

export default function DidYouMean({ query, basePath }: Props) {
  const [suggestion, setSuggestion] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestion(null);
      return;
    }

    let cancelled = false;
    getDidYouMean(query).then((result) => {
      if (!cancelled) {
        setSuggestion(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [query]);

  if (!suggestion || suggestion.toLowerCase() === query.toLowerCase()) return null;

  const href = `${basePath}?city=${encodeURIComponent(suggestion)}`;

  return (
    <p className="text-sm text-[var(--color-text-secondary)] mt-3">
      No encontramos resultados para &ldquo;<span className="font-medium">{query}</span>&rdquo;.
      {' '}Quisiste decir{' '}
      <a
        href={href}
        className="font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-dark)] underline underline-offset-2 transition-colors"
      >
        {suggestion}
      </a>
      ?
    </p>
  );
}
